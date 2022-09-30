export class ByteBuffer {
  public offset: number;
  public limit: number;

  private littleEndian: boolean;
  private data: DataView;

  constructor(capacity: number, littleEndian?: boolean) {
    this.data = new DataView(new ArrayBuffer(capacity));
    this.offset = 0;
    this.limit = capacity;
    this.littleEndian = !!littleEndian;
  }

  public static wrap(array: Uint8Array | ArrayBuffer, littleEndian?: boolean) {
    const result = new ByteBuffer(0, littleEndian);
    if (array instanceof ArrayBuffer) result.data = new DataView(array);
    else if (array instanceof Uint8Array)
      result.data = new DataView(array.buffer);

    result.offset = 0;
    result.limit = array.byteLength;

    return result;
  }

  public capacity() {
    return this.data.buffer.byteLength;
  }

  public skip(count: number) {
    this.offset += count;

    return this;
  }

  public remaining() {
    return this.limit - this.offset;
  }

  public toBuffer(clone?: boolean): Uint8Array {
    return new Uint8Array(this.data.buffer.slice(this.offset, this.limit));
  }

  public readUint8(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 1);

    let resp = this.data.getUint8(offset);

    if (position === undefined) this.offset++;
    return resp;
  }

  public writeUint8(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 1);

    this.data.setUint8(offset, number);

    if (position === undefined) this.offset++;
    return this;
  }

  public readInt8(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 1);

    let resp = this.data.getInt8(offset);

    if (position === undefined) this.offset++;
    return resp;
  }

  public writeInt8(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 1);

    this.data.setInt8(offset, number);

    if (position === undefined) this.offset++;
    return this;
  }

  public readInt16(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 2);

    let resp = this.data.getInt16(offset, this.littleEndian);

    if (position === undefined) this.offset += 2;
    return resp;
  }

  public writeInt16(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 2);

    this.data.setInt16(offset, number, this.littleEndian);

    if (position === undefined) this.offset += 2;
    return this;
  }

  public readUint16(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 2);

    let resp = this.data.getUint16(offset, this.littleEndian);

    if (position === undefined) this.offset += 2;
    return resp;
  }

  public writeUint16(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 2);

    this.data.setUint16(offset, number, this.littleEndian);

    if (position === undefined) this.offset += 2;
    return this;
  }

  public readInt32(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 4);

    let resp = this.data.getInt32(offset, this.littleEndian);

    if (position === undefined) this.offset += 4;
    return resp;
  }

  public writeInt32(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 4);

    this.data.setInt32(offset, number, this.littleEndian);

    if (position === undefined) this.offset += 4;
    return this;
  }

  public readUint32(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 4);

    let resp = this.data.getUint32(offset, this.littleEndian);

    if (position === undefined) this.offset += 4;
    return resp;
  }

  public writeFlot32(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 4);

    this.data.setFloat32(offset, number, this.littleEndian);

    if (position === undefined) this.offset += 4;
    return this;
  }

  public readFloat32(position?: number): number {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 4);

    let resp = this.data.getFloat32(offset, this.littleEndian);

    if (position === undefined) this.offset += 4;
    return resp;
  }

  public writeUint32(number: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    this.checkBounds(offset, this.limit, 4);

    this.data.setUint32(offset, number, this.littleEndian);

    if (position === undefined) this.offset += 4;
    return this;
  }

  public readCStringAsArray(position?: number): ByteBuffer {
    let offset = position === undefined ? this.offset : position;

    for (let i = 0; true; ++i) {
      this.checkBounds(offset + i, this.limit, 1);

      let newbyte = this.data.getUint8(offset + i);

      if (newbyte === 0) {
        if (position === undefined) this.offset += i + 1;

        return this.slice(offset, offset + i);
      }
    }
  }

  public readCString(position?: number): string {
    return ByteBuffer.stringFromUTF8Array(
      this.readCStringAsArray(position).toBuffer()
    );
  }

  public writeCString(str: string, position?: number): ByteBuffer {
    const data = Uint8Array.of(...ByteBuffer.toUTF8Array(str), 0);
    this.writeBytes(data, position);

    return this;
  }

  public slice(begin?: number, end?: number) {
    const cBegin = begin === undefined ? this.offset : begin;
    const cEnd = end === undefined ? this.limit : end;

    if (cBegin < 0 || cBegin > cEnd || cEnd > this.limit) {
      throw new RangeError(
        `Illegal bounds: 0 <= ${cBegin} <= ${cEnd} <= ${this.limit}`
      );
    }

    const result = this.clone();
    result.offset = cBegin;
    result.limit = cEnd;

    return result;
  }

  public clone() {
    const clone = new ByteBuffer(0);

    clone.limit = this.limit;
    clone.offset = this.offset;
    clone.littleEndian = this.littleEndian;
    clone.data = new DataView(this.data.buffer);

    return clone;
  }

  public readBytes(size: number, position?: number): ByteBuffer {
    const offset = position === undefined ? this.offset : position;
    const slice = this.slice(offset, offset + size);

    if (position === undefined) this.offset += size;

    return slice;
  }

  public append(data: Uint8Array | ByteBuffer, position?: number) {
    const offset = position === undefined ? this.offset : position;

    if (data instanceof ByteBuffer) {
      this.append(data.slice().toBuffer(), position);
    } else if (data instanceof Uint8Array) {
      this.checkBounds(offset, this.limit, data.length);

      const thisArray = new Uint8Array(this.data.buffer);
      thisArray.set(data, offset);
      if (position === undefined) this.offset += position;
    }
  }

  public writeBytes = this.append;

  public ensureCapacity(count: number) {
    if (this.offset + count <= this.data.buffer.byteLength) return;

    const newBuffer = new ArrayBuffer(this.offset + count);
    new Uint8Array(newBuffer).set(new Uint8Array(this.data.buffer));

    this.data = new DataView(newBuffer);
  }

  public compact() {
    if (this.remaining() === 0) {
      this.data = new DataView(new ArrayBuffer(0));
      return;
    }

    if (this.offset === 0 && this.limit === this.data.byteLength) return;
    const newBuffer = new ArrayBuffer(this.remaining());
    const newArray = new Uint8Array(newBuffer);
    newArray.set(this.slice().toBuffer());

    this.offset = 0;
    this.limit = newArray.length;

    this.data = new DataView(newBuffer);

    return;
  }

  private checkBounds(begin: number, end: number, count: number) {
    if (begin < 0 || end > this.capacity() || begin + count > end) {
      throw new RangeError(
        `Illegal offset: 0 <= ${begin} (+${count}) <= ${end} <= ${this.capacity()}`
      );
    }
  }

  private static stringFromUTF8Array(data: Iterable<number>): string {
    return new TextDecoder().decode(Uint8Array.from(data));
  }

  private static toUTF8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }
}
