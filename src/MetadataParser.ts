import { ByteBuffer } from "./ByteBuffer";

export interface StatStringData {
  speed: number;
  hideTerrain: boolean;
  mapExplored: boolean;
  alwaysVisible: boolean;
  default: boolean;
  observerMode: number;
  teamsTogether: boolean;
  fixedTeams: boolean;
  fullSharedUnitControl: boolean;
  randomHero: boolean;
  randomRaces: boolean;
  referees: boolean;
  mapChecksum: Uint8Array;
  mapChecksumSha1: Uint8Array;
  mapPath: string;
  creator: string;
}

export const decodeGameStatString = (str: Uint8Array): Uint8Array => {
  const bb = ByteBuffer.wrap(str, true);
  bb.offset = 0;
  bb.limit = str.length;

  const result = new ByteBuffer(str.length);

  let mask = 0;

  while (bb.remaining() > 0) {
    if (bb.offset % 8 == 0) mask = bb.readUint8();
    else {
      if ((mask & (1 << bb.offset % 8)) === 0)
        result.writeUint8(bb.readUint8() - 1);
      else result.writeUint8(bb.readUint8());
    }
  }

  return result.slice(0, result.offset).toBuffer(true);
};

export const parseStatString = (data: Uint8Array): StatStringData => {
  const bb = ByteBuffer.wrap(data, true);
  bb.limit = data.length;

  const speed = bb.readUint8();
  const secondByte = bb.readUint8();
  const thirdByte = bb.readUint8();
  const fourthByte = bb.readUint8();
  bb.skip(5);
  const checksum = bb.readBytes(4).toBuffer(true);
  bb.skip(0);
  const mapName = bb.readCString();
  const creator = bb.readCString();
  bb.skip(1);
  const checksumSha1 = bb.readBytes(20).toBuffer(true);
  return {
    speed,
    hideTerrain: !!(secondByte & 0b00000001),
    mapExplored: !!(secondByte & 0b00000010),
    alwaysVisible: !!(secondByte & 0b00000100),
    default: !!(secondByte & 0b00001000),
    observerMode: (secondByte & 0b00110000) >>> 4,
    teamsTogether: !!(secondByte & 0b01000000),
    fixedTeams: !!(thirdByte & 0b00000110),
    fullSharedUnitControl: !!(fourthByte & 0b00000001),
    randomHero: !!(fourthByte & 0b00000010),
    randomRaces: !!(fourthByte & 0b00000100),
    referees: !!(fourthByte & 0b01000000),
    mapPath: mapName,
    creator: creator,
    mapChecksum: checksum,
    mapChecksumSha1: checksumSha1,
  };
};
