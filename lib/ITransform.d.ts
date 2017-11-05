import { IOperate } from './IOperate';
/**
 * transform interface.
 *
 * @export
 * @interface ITransform
 * @extends {NodeJS.ReadWriteStream}
 */
export interface ITransform extends IOperate, NodeJS.ReadWriteStream {
    /**
     * custom set ITransform after pipe out.
     *
     * @param {ITransform} ouputStream
     * @returns {ITransform}
     *
     * @memberof ITransform
     */
    transformPipe?(ouputStream: ITransform): ITransform;
    /**
     * custom transform from source stream pipe in.
     *
     * @param {ITransform} sourceStream
     * @returns {ITransform}
     *
     * @memberof ITransform
     */
    transformSourcePipe?(sourceStream: ITransform): ITransform;
    /**
     * only typescript have this field
     */
    dts?: ITransform;
    /**
     * only typescript have this field
     */
    js?: ITransform;
}
