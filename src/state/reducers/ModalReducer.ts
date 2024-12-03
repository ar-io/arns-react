import { ModalState } from '../contexts/ModalState';

export type ModalAction = {
  type: 'setModalOpen';
  payload:
    | { showUpgradeAntModal: boolean }
    | { showEditUndernameModal: boolean }
    | { showPrimaryNameModal: boolean };
};

export const modalReducer = (
  state: ModalState,
  action: ModalAction,
): ModalState => {
  switch (action.type) {
    case 'setModalOpen':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};
