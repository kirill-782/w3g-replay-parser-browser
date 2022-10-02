import { ByteBuffer } from "./ByteBuffer";

export type AvailableActionData =
  | PauseGameData
  | ResumeGameData
  | SetGameSpeedData
  | IncreaseSpeedData
  | DecreaseSpeedData
  | SaveGameData
  | SaveGameFinishedData
  | AbilityActionData
  | PositionAbilityActionData
  | PositionAndObjectAbilityActionData
  | ItemActionData
  | AbilityTwoTargetTwoItemActionData
  | ChangeSelectionData
  | AssignGroupHotkeyData
  | SelectGroupHotkeyData
  | SelectSubGroupData
  | PreSubselectionData
  | Unknown1BData
  | SelectGroudItemData
  | CancelHeroRevivalData
  | RemoveQueuedUnitData
  | Unknown21Data
  | SinglePlayerChatData
  | AllyOptionsData
  | ResourceTransferData
  | ChatCommandData
  | ESCKeyEventData
  | Unknown62Data
  | OpenSkillSubmenuData
  | OpenBuildSubmenuData
  | MinimapPingData
  | Unknown69Data
  | Unknown6AData
  | SyncIntegerData
  | Unknown75Data;

export interface ActionHandlerList {
  [key: number]: (bb: ByteBuffer) => ActionData;
}

export interface ActionData {
  type: number;
  [key: string]: any;
}

export interface PauseGameData extends ActionData {
  type: 0x01;
}

const processPauseGame = (bb: ByteBuffer): PauseGameData => {
  return {
    type: 0x01,
  };
};

export interface ResumeGameData extends ActionData {
  type: 0x02;
}

const processResumeGame = (bb: ByteBuffer): ResumeGameData => {
  return {
    type: 0x02,
  };
};

export interface SetGameSpeedData extends ActionData {
  type: 0x03;
  speed: number;
}

const processSetGameSpeed = (bb: ByteBuffer): SetGameSpeedData => {
  return {
    type: 0x03,
    speed: bb.readUint8(),
  };
};

export interface IncreaseSpeedData extends ActionData {
  type: 0x04;
}

const processIncreaseSpeed = (bb: ByteBuffer): IncreaseSpeedData => {
  return {
    type: 0x04,
  };
};

export interface DecreaseSpeedData extends ActionData {
  type: 0x05;
}

const processDecreaseSpeed = (bb: ByteBuffer): DecreaseSpeedData => {
  return {
    type: 0x05,
  };
};

export interface SaveGameData extends ActionData {
  type: 0x06;
  fileName: string;
}

export const processSaveGame = (bb: ByteBuffer): SaveGameData => {
  return {
    type: 0x06,
    fileName: bb.readCString(),
  };
};

export interface SaveGameFinishedData extends ActionData {
  type: 0x07;
  unknown: number;
}

const processSaveGameFinished = (bb: ByteBuffer): SaveGameFinishedData => {
  return {
    type: 0x07,
    unknown: bb.readUint32(),
  };
};

export interface AbilityActionData extends ActionData {
  type: 0x10;
  flags: number;
  itemId: number;
  unknownA: number;
  unknownB: number;
}

const processAbilityAction = (bb: ByteBuffer): AbilityActionData => {
  return {
    type: 0x10,
    flags: bb.readUint16(),
    itemId: bb.readUint32(),
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
  };
};

export interface PositionAbilityActionData extends ActionData {
  type: 0x11;
  flags: number;
  itemId: number;
  unknownA: number;
  unknownB: number;
  x: number;
  y: number;
}

const processPositionAbilityAction = (
  bb: ByteBuffer
): PositionAbilityActionData => {
  return {
    type: 0x11,
    flags: bb.readUint16(),
    itemId: bb.readUint32(),
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    x: bb.readUint32(),
    y: bb.readUint32(),
  };
};

export interface PositionAndObjectAbilityActionData extends ActionData {
  type: 0x12;
  flags: number;
  itemId: number;
  unknownA: number;
  unknownB: number;
  targetX: number;
  targetY: number;
  objectId1: number;
  objectId2: number;
}

const processPositionAndObjectAbilityAction = (
  bb: ByteBuffer
): PositionAndObjectAbilityActionData => {
  return {
    type: 0x12,
    flags: bb.readUint16(),
    itemId: bb.readUint32(),
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    targetX: bb.readUint32(),
    targetY: bb.readUint32(),
    objectId1: bb.readUint32(),
    objectId2: bb.readUint32(),
  };
};

export interface ItemActionData extends ActionData {
  type: 0x13;
  flags: number;
  itemId: number;
  unknownA: number;
  unknownB: number;
  targetX: number;
  targetY: number;
  objectId1: number;
  objectId2: number;
  itemObjectId1: number;
  itemObjectId2: number;
}

const processItemAction = (bb: ByteBuffer): ItemActionData => {
  return {
    type: 0x13,
    flags: bb.readUint16(),
    itemId: bb.readUint32(),
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    targetX: bb.readUint32(),
    targetY: bb.readUint32(),
    objectId1: bb.readUint32(),
    objectId2: bb.readUint32(),
    itemObjectId1: bb.readUint32(),
    itemObjectId2: bb.readUint32(),
  };
};

export interface AbilityTwoTargetTwoItemActionData extends ActionData {
  type: 0x14;
  flags: number;
  itemIdA: number;
  unknownA: number;
  unknownB: number;
  targetAX: number;
  targetAY: number;
  itemIdB: number;
  unknownC: Uint8Array;
  targetBX: number;
  targetBY: number;
}

const processAbilityTwoTargetTwoItemAction = (
  bb: ByteBuffer
): AbilityTwoTargetTwoItemActionData => {
  return {
    type: 0x14,
    flags: bb.readUint16(),
    itemIdA: bb.readUint32(),
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    targetAX: bb.readUint32(),
    targetAY: bb.readUint32(),
    itemIdB: bb.readUint32(),
    unknownC: bb.readBytes(9).toBuffer(true),
    targetBX: bb.readUint32(),
    targetBY: bb.readUint32(),
  };
};

export interface ChangeSelectionData extends ActionData {
  type: 0x16;
  mode: number;
  objects: {
    objectId1: number;
    objectId2: number;
  }[];
}

const processChangeSelection = (bb: ByteBuffer): ChangeSelectionData => {
  const mode = bb.readUint8();
  const count = bb.readUint16();
  const objects = [];

  for (let i = 0; i < count; ++i) {
    objects.push({
      objectId1: bb.readUint32(),
      objectId2: bb.readUint32(),
    });
  }

  return {
    type: 0x16,
    mode,
    objects,
  };
};

export interface AssignGroupHotkeyData extends ActionData {
  type: 0x17;
  group: number;
  objects: {
    objectId1: number;
    objectId2: number;
  }[];
}

const processAssignGroupHotkey = (bb: ByteBuffer): AssignGroupHotkeyData => {
  const group = bb.readUint8();
  const count = bb.readUint16();
  const objects = [];

  for (let i = 0; i < count; ++i) {
    objects.push({
      objectId1: bb.readUint32(),
      objectId2: bb.readUint32(),
    });
  }

  return {
    type: 0x17,
    group,
    objects,
  };
};

export interface SelectGroupHotkeyData extends ActionData {
  type: 0x18;
  group: number;
  unknown: number;
}

const processSelectGroupHotkey = (bb: ByteBuffer): SelectGroupHotkeyData => {
  return {
    type: 0x18,
    group: bb.readUint8(),
    unknown: bb.readUint8(),
  };
};

export interface SelectSubGroupData extends ActionData {
  type: 0x19;
  itemId: number;
  objectId1: number;
  objectId2: number;
}

const processSelectSubGroup = (bb: ByteBuffer): SelectSubGroupData => {
  return {
    type: 0x19,
    itemId: bb.readUint32(),
    objectId1: bb.readUint32(),
    objectId2: bb.readUint32(),
  };
};

export interface PreSubselectionData extends ActionData {
  type: 0x1a;
}

const processPreSubselection = (bb: ByteBuffer): PreSubselectionData => {
  return {
    type: 0x1a,
  };
};

export interface Unknown1BData extends ActionData {
  type: 0x1b;
  unknownA: number;
  unknownB: number;
  unknownC: number;
}

const processUnknown1B = (bb: ByteBuffer): Unknown1BData => {
  return {
    type: 0x1b,
    unknownA: bb.readUint8(),
    unknownB: bb.readUint32(),
    unknownC: bb.readUint32(),
  };
};

export interface SelectGroudItemData extends ActionData {
  type: 0x1c;
  unknownA: number;
  objectId1: number;
  objectId2: number;
}

const processSelectGroudItem = (bb: ByteBuffer): SelectGroudItemData => {
  return {
    type: 0x1c,
    unknownA: bb.readUint8(),
    objectId1: bb.readUint32(),
    objectId2: bb.readUint32(),
  };
};

export interface CancelHeroRevivalData extends ActionData {
  type: 0x1d;
  unitId1: number;
  unitId2: number;
}

const processCancelHeroRevival = (bb: ByteBuffer): CancelHeroRevivalData => {
  return {
    type: 0x1d,
    unitId1: bb.readUint32(),
    unitId2: bb.readUint32(),
  };
};

export interface RemoveQueuedUnitData extends ActionData {
  type: 0x1e;
  slot: number;
  itemId: number;
}

const processRemoveQueuedUnit = (bb: ByteBuffer): RemoveQueuedUnitData => {
  return {
    type: 0x1e,
    slot: bb.readUint8(),
    itemId: bb.readUint32(),
  };
};

export interface Unknown21Data extends ActionData {
  type: 0x21;
  unknownA: number;
  unknownB: number;
}

const processUnknown21 = (bb: ByteBuffer): Unknown21Data => {
  return {
    type: 0x21,
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
  };
};

export interface SinglePlayerChatData extends ActionData {
  type:
    | 0x20
    | 0x22
    | 0x23
    | 0x24
    | 0x25
    | 0x26
    | 0x27
    | 0x28
    | 0x29
    | 0x2a
    | 0x2b
    | 0x2c
    | 0x2d
    | 0x2e
    | 0x2f
    | 0x30
    | 0x31
    | 0x32;
}

export interface SinglePlayerChatResourceData extends SinglePlayerChatData {
  type: 0x27 | 0x28 | 0x2d;
  unknown: number;
  count: number;
}

export interface SinglePlayerChatTimeData extends SinglePlayerChatData {
  type: 0x27 | 0x28 | 0x2d;
  time: number;
}

const processSinglePlayerChat = (
  bb: ByteBuffer
):
  | SinglePlayerChatData
  | SinglePlayerChatTimeData
  | SinglePlayerChatResourceData => {
  const actionId = bb.readUint8(bb.offset - 1);

  switch (actionId) {
    case 0x27:
    case 0x28:
    case 0x2d:
      return {
        type: actionId,
        unknown: bb.readUint8(),
        count: bb.readInt32(),
      };
    case 0x2e:
      return {
        type: 0x2e,
        time: bb.readFloat32(),
      };
    case 0x20:
    case 0x22:
    case 0x23:
    case 0x24:
    case 0x25:
    case 0x26:
    case 0x2a:
    case 0x2b:
    case 0x2c:
    case 0x2f:
    case 0x30:
    case 0x31:
    case 0x32:
      return {
        type: actionId,
      };
  }

  throw new Error("Unknown cheat " + actionId);
};

export interface AllyOptionsData extends ActionData {
  type: 0x50;
  slotId: number;
  flags: number;
}

const processAllyOptions = (bb: ByteBuffer): AllyOptionsData => {
  return {
    type: 0x50,
    slotId: bb.readUint8(),
    flags: bb.readUint32(),
  };
};

export interface ResourceTransferData extends ActionData {
  type: 0x51;
  slotId: number;
  gold: number;
  lumber: number;
}

const processResourceTransferData = (bb: ByteBuffer): ResourceTransferData => {
  return {
    type: 0x51,
    slotId: bb.readUint8(),
    gold: bb.readUint32(),
    lumber: bb.readUint32(),
  };
};

export interface ChatCommandData extends ActionData {
  type: 0x60;
  unknownA: number;
  unknownB: number;
  command: string;
}

const processChatCommand = (bb: ByteBuffer): ChatCommandData => {
  return {
    type: 0x60,
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    command: bb.readCString(),
  };
};

export interface ESCKeyEventData extends ActionData {
  type: 0x61;
}

const processESCKeyEvent = (bb: ByteBuffer): ESCKeyEventData => {
  return {
    type: 0x61,
  };
};

export interface Unknown62Data extends ActionData {
  type: 0x62;
  unknownA: number;
  unknownB: number;
  unknownC: number;
}

const processUnknown62 = (bb: ByteBuffer): Unknown62Data => {
  return {
    type: 0x62,
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    unknownC: bb.readUint32(),
  };
};

export interface OpenSkillSubmenuData extends ActionData {
  type: 0x65;
}

const processOpenSkillSubmenu = (bb: ByteBuffer): OpenSkillSubmenuData => {
  return {
    type: 0x65,
  };
};

export interface OpenBuildSubmenuData extends ActionData {
  type: 0x66;
}

const processOpenBuildSubmenu = (bb: ByteBuffer): OpenBuildSubmenuData => {
  return {
    type: 0x66,
  };
};

export interface MinimapPingData extends ActionData {
  type: 0x68;
  x: number;
  y: number;
  unknown: number;
}

const processMinimapPing = (bb: ByteBuffer): MinimapPingData => {
  return {
    type: 0x68,
    x: bb.readUint32(),
    y: bb.readUint32(),
    unknown: bb.readUint32(),
  };
};

export interface Unknown69Data extends ActionData {
  type: 0x69;
  unknownC: number;
  unknownD: number;
  unknownA: number;
  unknownB: number;
}

const processUnknown69 = (bb: ByteBuffer): Unknown69Data => {
  return {
    type: 0x69,
    unknownC: bb.readUint32(),
    unknownD: bb.readUint32(),
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
  };
};

export interface Unknown6AData extends ActionData {
  type: 0x6a;
  unknownA: number;
  unknownB: number;
  unknownC: number;
  unknownD: number;
}

const processUnknown6A = (bb: ByteBuffer): Unknown6AData => {
  return {
    type: 0x6a,
    unknownA: bb.readUint32(),
    unknownB: bb.readUint32(),
    unknownC: bb.readUint32(),
    unknownD: bb.readUint32(),
  };
};

export interface SyncIntegerData extends ActionData {
  type: 0x6b;
  filename: string;
  missionKey: string;
  key: string;
  value: number;
}

const processSyncInteger = (bb: ByteBuffer): SyncIntegerData => {
  return {
    type: 0x6b,
    filename: bb.readCString(),
    missionKey: bb.readCString(),
    key: bb.readCString(),
    value: bb.readUint32(),
  };
};

export interface Unknown75Data extends ActionData {
  type: 0x75;
  unknownA: number;
}

const processUnknown75 = (bb: ByteBuffer): Unknown75Data => {
  return {
    type: 0x75,
    unknownA: bb.readUint8(),
  };
};

const DEFAULT_ACTION_HANDLERS: ActionHandlerList = {
  0x1: processPauseGame,
  0x2: processResumeGame,
  0x3: processSetGameSpeed,
  0x4: processIncreaseSpeed,
  0x5: processDecreaseSpeed,
  0x6: processSaveGame,
  0x7: processSaveGameFinished,
  0x10: processAbilityAction,
  0x11: processPositionAbilityAction,
  0x12: processPositionAndObjectAbilityAction,
  0x13: processItemAction,
  0x14: processAbilityTwoTargetTwoItemAction,
  0x16: processChangeSelection,
  0x17: processAssignGroupHotkey,
  0x18: processSelectGroupHotkey,
  0x19: processSelectSubGroup,
  0x1a: processPreSubselection,
  0x1b: processUnknown1B,
  0x1c: processSelectGroudItem,
  0x1d: processCancelHeroRevival,
  0x1e: processRemoveQueuedUnit,
  0x20: processSinglePlayerChat,
  0x21: processUnknown21,
  0x22: processSinglePlayerChat,
  0x23: processSinglePlayerChat,
  0x24: processSinglePlayerChat,
  0x25: processSinglePlayerChat,
  0x26: processSinglePlayerChat,
  0x27: processSinglePlayerChat,
  0x28: processSinglePlayerChat,
  0x29: processSinglePlayerChat,
  0x2a: processSinglePlayerChat,
  0x2b: processSinglePlayerChat,
  0x2c: processSinglePlayerChat,
  0x2d: processSinglePlayerChat,
  0x2e: processSinglePlayerChat,
  0x30: processSinglePlayerChat,
  0x31: processSinglePlayerChat,
  0x32: processSinglePlayerChat,
  0x50: processAllyOptions,
  0x51: processResourceTransferData,
  0x60: processChatCommand,
  0x61: processESCKeyEvent,
  0x62: processUnknown62,
  0x66: processOpenSkillSubmenu,
  0x67: processOpenBuildSubmenu,
  0x68: processMinimapPing,
  0x69: processUnknown69,
  0x6a: processUnknown6A,
  0x6b: processSyncInteger,
  0x75: processUnknown1B,
};

export interface ActionCommandBlock {
  playerId: number;
  actions: ActionData[];
  remaingBuffer: Uint8Array;
}

export class ActionParser {
  private actionHandlers: ActionHandlerList;

  constructor(actionHandler?: ActionHandlerList) {
    this.actionHandlers = { ...DEFAULT_ACTION_HANDLERS, ...actionHandler };
  }

  // Action payload

  public processActionData = (data: Uint8Array) => {
    const bb = ByteBuffer.wrap(data, true);
    bb.limit = data.length;

    const actionBlocks: ActionCommandBlock[] = [];

    while (bb.remaining()) {
      const playerId = bb.readUint8();
      const actionsLength = bb.readUint16();
      const actions: ActionData[] = [];

      const currentBlockEnd = bb.offset + actionsLength;

      while (bb.offset < currentBlockEnd) {
        const actionId = bb.readUint8();

        if (this.actionHandlers[actionId]) {
          actions.push(this.actionHandlers[actionId](bb));
        } else break;
      }

      const remaingBuffer = bb.slice(bb.offset, currentBlockEnd).toBuffer(true);
      bb.offset = currentBlockEnd;

      actionBlocks.push({
        playerId,
        actions,
        remaingBuffer,
      });
    }

    return actionBlocks;
  };
}
