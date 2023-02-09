export type Decompressor = (data: Uint8Array) => Uint8Array;
import { BlockParser, RecordsResult } from "./BlockParser";
import { ByteBuffer } from "./ByteBuffer";

const REPLAY_MAGIC_HEADER = "Warcraft III recorded game\x1A";

export interface HeaderData {
  firstBlockOffset: number;
  compressedSize: number;
  headerVersion: number;
  decompressedSize: number;
  blockCount: number;
}

export interface SubHeaderData {
  productId: number;
  version: number;
  buildNumber: number;
  flags: number;
  lengthMilis: number;
  crc32: Uint8Array;
}

export interface ReplayResult {
  header: HeaderData;
  subHeader: SubHeaderData;
  records: RecordsResult;
}

export class ReplayParser {
  public parseReplay(data: ArrayBuffer | Uint8Array): ReplayResult {
    const bb = ByteBuffer.wrap(data, true);
    bb.limit = bb.capacity();

    const magicData = bb.readCString();

    if (magicData !== REPLAY_MAGIC_HEADER)
      throw new Error("Invalid file header");

    const headerData = ReplayParser.parseHeaderData(bb);

    if (headerData.headerVersion !== 1)
      throw new Error("Unknown header version " + headerData.headerVersion);

    const subHeaderData = ReplayParser.parseSubHeaderData(bb);
    bb.offset = headerData.firstBlockOffset;

    const blockParser = new BlockParser();

    return {
      header: headerData,
      subHeader: subHeaderData,
      records: blockParser.parseBlocks(
        bb,
        headerData.blockCount,
        ReplayParser.isReforged(subHeaderData.buildNumber, subHeaderData.version)
      ),
    };
  }

  public static parseHeaderData = (bb: ByteBuffer): HeaderData => {
    return {
      firstBlockOffset: bb.readUint32(),
      compressedSize: bb.readUint32(),
      headerVersion: bb.readUint32(),
      decompressedSize: bb.readUint32(),
      blockCount: bb.readUint32(),
    };
  };

  public static parseSubHeaderData = (bb: ByteBuffer): SubHeaderData => {
    return {
      productId: bb.readUint32(),
      version: bb.readUint32(),
      buildNumber: bb.readUint16(),
      flags: bb.readUint16(),
      lengthMilis: bb.readUint32(),
      crc32: bb.readBytes(4).toBuffer(true),
    };
  };

  public static isReforged = (buildNumber: number, version: number) => {
    return version > 31;
  };
}
