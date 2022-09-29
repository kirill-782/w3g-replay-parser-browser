import Zlib from "zlib";
import ByteBuffer from "bytebuffer";
import {
  decodeGameStatString,
  parseStatString,
  StatStringData,
} from "./MetadataParser.js";

export type AvailableRecord =
  | GameRecord
  | PlayerRecord
  | StartRecord
  | ReplayFirstStartRecord
  | ReplaySecondStartRecord
  | ReplayThridStartRecord
  | ChatRecord
  | LeaveRecord
  | TimeSlotRecord
  | ReforgedPlayerMetadataRecord
  | ChecksumRecord;

export interface TimedRecord {
  time: number;
}

export interface RecordsResult {
  gameInfo?: GameRecord;
  startInfo?: StartRecord;
  players: PlayerRecord[];
  playerLeave: (LeaveRecord & TimedRecord)[];
  chatMessages: (ChatRecord & TimedRecord)[];
  actions: (TimeSlotRecord & TimedRecord)[];
  others: AvailableRecord[];
}

interface AbstractRecord {
  type: number;
}

export interface GameRecord extends AbstractRecord {
  type: 0x0;
  hostPlayer: PlayerInfo;
  gameName: string;
  statStringRaw: Uint8Array;
  statString: StatStringData;
  playersCount: number;
  gameType: number;
  languageId: number;
}

export interface TimeSlotRecord extends AbstractRecord {
  type: 0x1f | 0x1e;
  timeIncrement: number;
  rawData: Uint8Array;
}

export interface LeaveRecord extends AbstractRecord {
  type: 0x17;
  reason: number;
  playerId: number;
  result: number;
  unknown: number;
}

export interface PlayerRecord extends AbstractRecord, PlayerInfo {
  type: 0x16;
  unknown: number;
}

export interface ReforgedPlayerMetadataRecord extends AbstractRecord {
  type: 0x39;
  subType: number;
  rawData: Uint8Array;
}

export interface ChecksumRecord extends AbstractRecord {
  type: 0x22;
  checksum: number;
}

export interface ChatRecord extends AbstractRecord {
  type: 0x20;
  playerId: number;
  flags: number;
  chatMode?: number;
  message: string;
}

export interface ReplayFirstStartRecord extends AbstractRecord {
  type: 0x1a;
  unknown: number;
}

export interface ReplaySecondStartRecord extends AbstractRecord {
  type: 0x1b;
  unknown: number;
}

export interface ReplayThridStartRecord extends AbstractRecord {
  type: 0x1c;
  unknown: number;
}

export interface StartRecord extends AbstractRecord {
  type: 0x19;
  slots: SlotInfo[];
  randomSeed: number;
  gameMode: number;
  startSpotCount: number;
}

export interface PlayerInfo {
  playerId: number;
  playerName: string;
  runtimeOfPlayers?: number;
  race?: number;
}

export interface SlotInfo {
  playerId: number;
  downloadStatus: number;
  slotStatus: number;
  computer: number;
  team: number;
  color: number;
  race: number;
  computerType: number;
  handicap: number;
}

const decompressor = (data: Uint8Array) =>  {
  return Zlib.inflateSync(data, { finishFlush: Zlib.constants.Z_SYNC_FLUSH });
}

export class BlockParser {

  public parseBlocks(bb: ByteBuffer, blockCount: number, isReforged: boolean) {
    let decompressedData = new ByteBuffer(8192, true);
    decompressedData.limit = 0;

    const result: RecordsResult = {
      gameInfo: undefined,
      startInfo: undefined,
      players: [],
      chatMessages: [],
      actions: [],
      others: [],
      playerLeave: [],
    };

    for (let i = 0; i < blockCount; ++i) {
      const compressedBlockSize = bb.readUint16();
      if (isReforged) bb.skip(2);

      const decompressedBlockSize = bb.readUint16();
      bb.skip(isReforged ? 6 : 4);

      const data = bb.readBytes(compressedBlockSize).toBuffer();
      const decompressedDataBlock = decompressor(data).slice(0, decompressedBlockSize);
      appendAndCompact(
        decompressedDataBlock,
        decompressedData
      );

      if (i === 0) decompressedData.readUint32(); // Unknown start

      let time = 0;
      let recordsParsed = 0;

      while (true) {
        if (
          recordsParsed > 0 &&
          decompressedData.offset + 1 < decompressedData.limit &&
          decompressedData.readUint8(decompressedData.offset) === 0
        )
          break;

        const nextRecord = getNextRecord(decompressedData);

        if (!nextRecord) break;

        recordsParsed++;

        switch (nextRecord.type) {
          case 0x00:
            result.gameInfo = nextRecord;
            break;
          case 0x16:
            result.players.push(nextRecord);
            break;
          case 0x19:
            result.startInfo = nextRecord;
            break;
          case 0x17:
            result.playerLeave.push({ ...nextRecord, time });
            break;
          case 0x20:
            result.chatMessages.push({ ...nextRecord, time });
            break;
          case 0x1f:
            time += nextRecord.timeIncrement;
            result.actions.push({ ...nextRecord, time });
            break;
          case 0x1e:
            time += nextRecord.timeIncrement;
            result.actions.push({ ...nextRecord, time });
            break;
          default:
            result.others.push(nextRecord);
        }
      }
    }

    return result;
  }
}

const appendAndCompact = (data: Uint8Array, bb: ByteBuffer) => {
  bb.compact();
  bb.ensureCapacity(bb.limit + data.length)
  bb.append(data, bb.limit);
  bb.limit += data.length;

  return;
};

const getNextRecord = (bb: ByteBuffer): AvailableRecord | undefined => {
  if (bb.offset + 1 > bb.limit) return undefined;

  const recordId = bb.readUint8();

  const result = ((): AvailableRecord | undefined => {
    switch (recordId) {
      case 0x0:
        return parseGameRecord(bb);
      case 0x16:
        return parsePlayerRecord(bb);
      case 0x19:
        return parseStartRecord(bb);
      case 0x1a:
        return { type: 0x1a, unknown: bb.readUint32() };
      case 0x1b:
        return { type: 0x1b, unknown: bb.readUint32() };
      case 0x1c:
        return { type: 0x1c, unknown: bb.readUint32() };
      case 0x20:
        return parseChatRecord(bb);
      case 0x17:
        return parseLeaveRecord(bb);
      case 0x1f:
        return parseTimeSlot(bb, 0x1f);
      case 0x1e:
        return parseTimeSlot(bb, 0x1e);
      case 0x39:
        return parsePlayerReforgedRecord(bb);
      case 0x22:
        return parseChecksumRecord(bb);
      default:
        throw new Error("Unknown recordId " + recordId);
    }
  })();

  if (result === undefined) bb.offset--;

  return result;
};

const parseTimeSlot = (bb: ByteBuffer, type: 0x1f | 0x1e): TimeSlotRecord => {
  if (
    bb.offset + 2 > bb.limit ||
    bb.offset + bb.readUint16(bb.offset) + 2 > bb.limit
  )
    return undefined;

  const length = bb.readUint16();

  return {
    type,
    timeIncrement: bb.readUint16(),
    rawData: bb.readBytes(length - 2).toBuffer(),
  };
};

const parseLeaveRecord = (bb: ByteBuffer): LeaveRecord => {
  if (bb.offset + 13 > bb.limit) return undefined;

  return {
    type: 0x17,
    reason: bb.readUint32(),
    playerId: bb.readUint8(),
    result: bb.readUint32(),
    unknown: bb.readUint32(),
  };
};

const parseChatRecord = (bb: ByteBuffer): ChatRecord => {
  if (
    bb.offset + 3 > bb.limit ||
    bb.offset + bb.readUint16(bb.offset + 1) > bb.limit
  )
    return undefined;

  const playerId = bb.readUint8();
  bb.readUint16();
  const flags = bb.readUint8();
  const chatMode = flags !== 0x10 ? bb.readUint32() : undefined;
  const message = bb.readCString();

  return {
    type: 0x20,
    playerId,
    flags,
    chatMode,
    message,
  };
};

const parseGameRecord = (bb: ByteBuffer): GameRecord => {
  const hostPlayer = parsePlayerInfo(bb);
  const gameName = bb.readCString();
  bb.readUint8();

  // Find null byte
  bb.mark();
  while (bb.readByte());
  const statStringLength = bb.offset - bb.markedOffset;
  bb.reset();

  const statStringRaw = bb.readBytes(statStringLength - 1).toBuffer(true);
  bb.skip(1); // Skip null byte

  const playersCount = bb.readUint32();
  const gameType = bb.readUint32();
  const languageId = bb.readUint32();

  return {
    type: 0x0,
    hostPlayer,
    gameName,
    statStringRaw,
    playersCount,
    gameType,
    languageId,
    statString: parseStatString(decodeGameStatString(statStringRaw)),
  };
};

const parsePlayerReforgedRecord = (
  bb: ByteBuffer
): ReforgedPlayerMetadataRecord => {
  if (
    bb.offset + 5 > bb.limit ||
    bb.offset + bb.readUint32(bb.offset + 1) > bb.limit
  )
    return undefined;

  const subType = bb.readUint8();
  const followingBytes = bb.readUint32();

  return {
    type: 0x39,
    subType,
    rawData: bb.readBytes(followingBytes).toBuffer(true),
  };
};

const parseChecksumRecord = (bb: ByteBuffer): ChecksumRecord => {
  if (
    bb.offset + 1 > bb.limit ||
    bb.offset + bb.readUint8(bb.offset) + 1 > bb.limit
  )
    return undefined;

  const followingLength = bb.readUint8();
  const checksum = bb.readUint32();
  bb.skip(followingLength - 4);

  return {
    type: 0x22,
    checksum,
  };
};

const parsePlayerRecord = (bb: ByteBuffer): PlayerRecord => {
  return {
    type: 0x16,
    ...parsePlayerInfo(bb),
    unknown: bb.readUint32(),
  };
};

const parseStartRecord = (bb: ByteBuffer): StartRecord => {
  const countBytes = bb.readUint16(bb.offset);

  if (bb.offset + countBytes > bb.limit) return undefined;
  else bb.offset += 2;

  const slotCount = bb.readUint8();
  const slots = [];

  for (let i = 0; i < slotCount; ++i) {
    slots.push(parseSlotInfo(bb));
  }

  return {
    type: 0x19,
    slots,
    randomSeed: bb.readUint32(),
    gameMode: bb.readUint8(),
    startSpotCount: bb.readUint8(),
  };
};

const parseSlotInfo = (bb: ByteBuffer): SlotInfo => {
  return {
    playerId: bb.readUint8(),
    downloadStatus: bb.readUint8(),
    slotStatus: bb.readUint8(),
    computer: bb.readUint8(),
    team: bb.readUint8(),
    color: bb.readUint8(),
    race: bb.readUint8(),
    computerType: bb.readUint8(),
    handicap: bb.readUint8(),
  };
};

const parsePlayerInfo = (bb: ByteBuffer): PlayerInfo => {
  const playerRecord: PlayerInfo = {
    playerId: bb.readUint8(),
    playerName: bb.readCString(),
  };

  const additionalSize = bb.readUint8();

  switch (additionalSize) {
    case 1:
      bb.readUint8();
      break;
    case 8:
      playerRecord.runtimeOfPlayers = bb.readUint8();
      playerRecord.race = bb.readUint8();
      break;
    default:
      bb.skip(additionalSize);
  }

  return playerRecord;
};
