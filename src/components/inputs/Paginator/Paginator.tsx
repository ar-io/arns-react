import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '../../icons';
import './styles.css';

function Paginator({
  itemCount,
  setPageRange,
  pageRange,
  itemsPerPage,
}: {
  itemCount: number;
  setPageRange: Dispatch<SetStateAction<number[]>>;
  pageRange: Array<number>;
  itemsPerPage: number;
}) {
  const [pageCount, setPageCount] = useState(itemCount / itemsPerPage); // total possible
  const [currentPage, setCurrentPage] = useState(1);
  const [pageButtons, setPageButtons] = useState<JSX.Element[]>([<></>]);

  useEffect(() => {
    setPageCount(() => itemCount / itemsPerPage);
    setCurrentPage(pageRange[0] / itemsPerPage + 1);
    generatePageButtons().then((buttons) => setPageButtons(buttons));
  }, [itemCount, pageRange, itemsPerPage]);

  async function generatePageButtons() {
    const buttons = [];
    for (let i = 0; i < pageCount; i++) {
      buttons.push(
        <button
          key={i}
          className="paginator-button"
          onClick={() =>
            setPageRange([i * itemsPerPage, i * itemsPerPage + itemsPerPage])
          }
          style={
            pageRange[0] === i * itemsPerPage ? { background: '#757575' } : {}
          }
        >
          {i + 1}
        </button>,
      );
    }
    return buttons;
  }
  function generateMiddleButtons() {
    // middle buttons render on-demand
    const buttons: JSX.Element[] = [];
    if (currentPage < 6) {
      // return if less than page 6 return
      return;
    }
    for (
      let i = 0;
      i < currentPage &&
      buttons.length < 5 &&
      currentPage + buttons.length < pageCount - 4;
      i++
    ) {
      const thisPage = currentPage + buttons.length; // calculate page number from generated buttons and current page
      const newPage = thisPage - 1;
      buttons.push(
        <button
          key={thisPage}
          className="paginator-button"
          onClick={() =>
            setPageRange([
              newPage * itemsPerPage,
              newPage * itemsPerPage + itemsPerPage,
            ])
          }
          style={
            pageRange[0] === newPage * itemsPerPage
              ? { background: '#757575' }
              : {}
          }
        >
          {thisPage}
        </button>,
      );
    }
    return buttons;
  }

  return (
    <>
      <div className="flex-row center white" style={{ gap: '5px' }}>
        <button
          className="paginator-button"
          onClick={() => {
            if (currentPage > 1) {
              const newPage = currentPage - 2;
              setPageRange([
                newPage * itemsPerPage,
                newPage * itemsPerPage + itemsPerPage,
              ]);
              console.log(currentPage, [
                newPage * itemsPerPage,
                newPage * itemsPerPage + itemsPerPage,
              ]);
            }
          }}
        >
          <ChevronLeftIcon width={'24px'} height={'24px'} />
        </button>
        {pageButtons?.map((button, index) => {
          if (index < 5) {
            return button;
          }
        })}
        {currentPage > 5 ? '...' : <></>}

        {generateMiddleButtons()}
        {pageCount > 6 ? '...' : <></>}
        {pageButtons?.map((button, index) => {
          if (index > pageButtons.length - 6 && pageCount > 7) {
            return button;
            // show the last six pages
          }
        })}
        <button
          className="paginator-button"
          onClick={() => {
            if (currentPage < pageCount) {
              setPageRange([
                currentPage * itemsPerPage,
                currentPage * itemsPerPage + itemsPerPage,
              ]);
            }
          }}
        >
          <ChevronRightIcon width={'24px'} height={'24px'} />
        </button>
      </div>
      <span className="text white center bold">
        Current page:&nbsp;{currentPage}
      </span>
      <span className="text white center bold">
        showing results:&nbsp;{pageRange[0]}&nbsp;/&nbsp;{pageRange[1]}
      </span>
    </>
  );
}

export default Paginator;
