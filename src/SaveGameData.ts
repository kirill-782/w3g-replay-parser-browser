export type Decompressor = (data: Uint8Array) => Uint8Array;
import { ByteBuffer } from "./ByteBuffer";
import {
  BlockParser,
  decompressor,
  parseSlotInfo,
  RecordsResult,
  SlotInfo,
} from "./BlockParser";
import { HeaderData, SubHeaderData } from "./ReplayParser";
import ReplayParser from "./index";

const REPLAY_MAGIC_HEADER = "Warcraft III recorded game\x1A";

export interface SaveGameData {
  mapPath: string;
  gameName: string;
  slots: SlotInfo[];
  randomSeed: number;
  gameMode: number;
  startSpotCount: number;
  magicNumber: number;
}

export interface SaveGameResult {
  header: HeaderData;
  subHeader: SubHeaderData;
  data: SaveGameData;
}

export class SaveGameParser {
  public parseSaveGame(
    data: ArrayBuffer | Uint8Array
  ): SaveGameResult {
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

    const isReforged = ReplayParser.isReforged(
      subHeaderData.buildNumber,
      subHeaderData.version
    );

    // First block data

    const compressedBlockSize = bb.readUint16();
    if (isReforged) bb.skip(2);

    const decompressedBlockSize = bb.readUint16();
    bb.skip(isReforged ? 6 : 4);

    const compressedDataBlock = bb.readBytes(compressedBlockSize).toBuffer();
    const decompressedDataBlock = decompressor(compressedDataBlock).slice(
      0,
      decompressedBlockSize
    );

    const blockBb = ByteBuffer.wrap(decompressedDataBlock, true);

    const mapPath = blockBb.readCString();
    blockBb.readCString(); // ???
    const gameName = blockBb.readCString();
    blockBb.readCString(); // ???
    blockBb.readCString(); // stat string

    blockBb.skip(10);

    const numSlots = blockBb.readUint8();
    const slots = new Array<SlotInfo>();

    for (let i = 0; i < numSlots; ++i) {
      slots[i] = parseSlotInfo(blockBb);
    }

    const randomSeed = blockBb.readUint32();
    const gameMode = blockBb.readUint8();
    const startSpotCount = blockBb.readUint8();
    const magicNumber = blockBb.readUint32();

    return {
      header: headerData,
      subHeader: subHeaderData,
      data: {
        mapPath,
        gameName,
        slots,
        randomSeed,
        gameMode,
        startSpotCount,
        magicNumber,
      },
    };
  }
}
