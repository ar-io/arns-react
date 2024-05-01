import { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

// Create the modal context
const ModalContext = createContext({
  showModal: (modal: JSX.Element) => console.log(modal),
  hideModal: () => console.log('hideModal'),
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: JSX.Element[] }) => {
  const [modalContent, setModalContent] = useState<JSX.Element | undefined>(
    undefined,
  );

  const showModal = (content: JSX.Element) => {
    setModalContent(content);
  };

  const hideModal = () => {
    setModalContent(undefined);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            {modalContent}
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  );
};
