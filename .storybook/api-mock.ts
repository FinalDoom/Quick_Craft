import type {RawApi} from '../src/api/api';
import {recipeInfo} from '../src/generated/recipe_info';

const ApiMock: RawApi = {
  unequip: {
    status: 'success',
    response: '',
  },
  equip: {
    status: 'success',
    response: '',
  },
  getInventoryCounts: {
    status: 'success',
    response: recipeInfo.map(({id}) => ({itemid: id, amount: 99, equipid: ''})),
  },
  getEquippedIds: {
    status: 'success',
    response: [
      {} as {
        slotid: string | number;
        equipid: string | number;
        itemid: string | number;
        breakTime: string | Date;
        buffID: string | number;
        id: string | number;
        experience: string | number;
        level: string | number;
      },
    ],
  },
  getEquipmentInfo: {
    status: 'success',
    response: [
      {} as {
        id: string | number;
        itemid: string | number;
        timeUntilBreak: 'Null' | string | number;
        equippedBefore: boolean;
        experience: string | number;
        level: string | number;
      },
    ],
  },
};

export default ApiMock;
