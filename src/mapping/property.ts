import {InternalMapping} from "./internalMapping";
import {MappingModel} from "./mappingModel";
import {PersistenceError} from "../persistenceError";

/**
 * @hidden
 */
export class Property implements MappingModel.Property {

    /**
     * The name of the property.
     */
    name: string;

    /**
     * The property flags.
     */
    flags: MappingModel.PropertyFlags;

    /**
     * The name of the database document field.
     */
    field: string;

    /**
     * Indicates if null values should be saved for this property. By default a property is removed from the object
     * when saved if it has a value of `null` or `undefined`.
     */
    nullable: boolean;

    /**
     * The name of the property in the target TypeMapping that is used to retrieve the value of this property.
     */
    inverseOf: string;

    /**
     * The mapping of the property.
     */
    mapping: InternalMapping;

    constructor(name: string, mapping: InternalMapping) {
        if(!name) {
            throw new PersistenceError("Missing required argument 'name'.");
        }
        if(!mapping) {
            throw new PersistenceError("Missing required argument 'mapping'.");
        }
        this.name = name;
        this.mapping = mapping;
    }

    setFlags(flags: MappingModel.PropertyFlags): void {

        if(this.flags === undefined) {
            this.flags = flags;
        }
        else {
            this.flags |= flags;
        }
    }

    hasFlags(flags: MappingModel.PropertyFlags): boolean {

        return this.flags != undefined && ((this.flags & flags) === flags);
    }

    getPropertyValue(obj: any): any {

        // Generate getters for VM optimization on first call to the getter. Verified that this improves performance
        // more than 3x for subsequent calls. We need to wait until the first call to generate the getter because
        // the 'flags' are not necessarily set in the constructor. See: http://tinyurl.com/kap2g2r
        this.getPropertyValue = <any>(new Function("o", "return o['" + this.name + "']"));
        return obj[this.name];
    }

    setPropertyValue(obj: any, value: any): void {

        // See comment in getPropertyValue. Verified performance improvement for setting a value as well, but for
        // setting we got almost a 10x performance improvement.
        this.setPropertyValue = <any>(new Function("o,v", "o['" + this.name + "'] = v"));
        obj[this.name] = value;
    }

    getFieldValue(document: any): any {

        this.getFieldValue = <any>(new Function("o", "return o['" + this.field + "']"));
        return document[this.field];
    }

    setFieldValue(document: any, value: any): void {

        this.setFieldValue = <any>(new Function("o,v", "o['" + this.field + "'] = v"));
        document[this.field] = value;
    }
}
