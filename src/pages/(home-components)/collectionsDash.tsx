import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { CollectionsRank, RankPeriod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { trpc } from "utils/trpc";

export default function CollectionsDash() {

  const rankOptions = [...Object.values(CollectionsRank)];
  const timeOptions = [...Object.values(RankPeriod)];

  const [refetch, triggerRefetch] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [ranking, setRanking] = useState<CollectionsRank>(CollectionsRank.avgPrice);
  const [timePeriod, setTimePeriod] = useState<RankPeriod>(RankPeriod.oneDay);

  const { data: collectionsData, isFetching, isInitialLoading } = trpc.model.nft.getTopCollections.useQuery({
    rank: ranking,
    time: timePeriod,
    cursor: pageIndex
  }, {
    onSuccess(data) {
      triggerRefetch(false);
    },
    enabled: refetch
  });
  

  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const viewLength = collectionsData?.collections.length?? 10;
  const dataSize = collectionsData?.max?? collectionsData?.collections.length?? 1;
  const pages = Math.round(dataSize/viewLength) + (dataSize % viewLength > 0? 1: 0);

  const displayRank = {
    "avgPrice": "Average Price",
    "maxPrice": "Maximum Price",
    "salesCount": "Sales Count",
    "salesVolume": "Sales Volume"
  };

  const Footer: React.FC = () => {
    const PageIndex: React.FC<{ct: number}> = ({ct}) => { 
      return (
        <span className="font-medium">{`${ct}`}</span>
      );
    }
  
    const PageSelector: React.FC = () => {
      const buttonCallback = (fn: () => void) => {
        return () => {
          fn();
          triggerRefetch(true);
        }
      };

      const EdgeButton: React.FC<{left: boolean, skipfinal?: boolean}> = ({left, skipfinal=false}) => {
        const pageToSkip = skipfinal && left
          ? 0
          : skipfinal
          ? pages - 1
          : left
          ? pageIndex - 1
          : pageIndex + 1;
        return (
          <button 
            key={left? "left": "right"}
            disabled={(left && pageIndex === 0) || (!left && pageIndex === pages - 1)}
            className={`
              relative items-center px-2 py-[10px] text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 bg-inherit
              ${skipfinal? left? "rounded-l-md": "rounded-r-md": ""} ${skipfinal? "hidden lg:inline-flex" : "inline-flex"}
            `}
            onClick={buttonCallback(() => setPageIndex(pageToSkip))}
            >
            <span className="sr-only">{skipfinal? left? "First Page": "Last Page": left? "Previous Page" : "Next Page"}</span>
            { skipfinal
              ? left ? <ChevronDoubleLeftIcon className="h-4 w-4"/> : <ChevronDoubleRightIcon className="h-4 w-4"/>
              : left ? <ChevronLeftIcon className="h-4 w-4"/> : <ChevronRightIcon className="h-4 w-4"/>
            }
          </button>
        );
      }
  
      const PageButton: React.FC<{value: number, edge: boolean, selected: boolean}> = ({value, edge, selected}) => {
        return (
          <button
            className={`relative hidden items-center px-4 py-2 text-sm font-medium focus:z-20 ${
              selected
              ? "z-10 sm:inline-flex border border-indigo-500 bg-indigo-100  text-indigo-600"
              : edge
              ? "bg-inherit text-gray-500 hover:bg-gray-50 md:inline-flex"
              : "bg-inherit text-gray-500 hover:bg-gray-50 sm:inline-flex"
            }`} 
            onClick={buttonCallback(() => setPageIndex(value))}>
            {value + 1}
          </button>
        );
      }
  
      const viewBox = pageIndex <= 0
        ? [pageIndex, pageIndex + 1, pageIndex + 2]
        : pageIndex >= pages - 1
        ? [pageIndex - 2, pageIndex - 1, pageIndex]
        : [pageIndex - 1, pageIndex, pageIndex + 1];
  
      const leftBox = pageIndex < pages / 2
        ? viewBox
        : [0, 1, 2];
  
      const rightBox = pageIndex >= pages / 2
        ? viewBox
        : [pages - 3, pages - 2, pages - 1];
  
      return (
        <>
          <EdgeButton left={true} skipfinal={true}/>
          <EdgeButton left={true}/>
          {/* LeftBox */}
          {leftBox.map((v, idx) => <PageButton key={v.toLocaleString()} value={v} edge={idx === 2} selected={pageIndex === v}/>)}
          
          {/* Ellipsis */}
          <span className="relative inline-flex items-center bg-inherit px-4 py-2 text-sm font-medium text-gray-700">...</span>
  
          {/* RightBox */}
          {rightBox.map((v, idx) => <PageButton key={v.toLocaleString()} value={v} edge={idx === 0} selected={pageIndex === v}/>)}
          
          <EdgeButton left={false}/>
          <EdgeButton left={false} skipfinal={true}/>
        </>
      );
    }

    return (
      <>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between px-5 py-3">
          {/* Left */}
          <div>
            {/* Indexing Numbers - "x + 1 to x + 10 of max" */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing&nbsp;
              <PageIndex ct={pageIndex * 10 + 1}/>&nbsp;to&nbsp;
              <PageIndex ct={pageIndex * 10 + viewLength}/>&nbsp;of&nbsp;
              <PageIndex ct={dataSize}/>&nbsp;collections
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center">
            <PageSelector/>
          </div> 
        </div>
        </>
    );
  }

  const Table: React.FC<{children?: React.ReactNode}> = ({children}) => {
    const handleRankChange = (e: any) => {
      setRanking(e.target.value);
      triggerRefetch(true);
    }
    const handleTimeChange = (e: any) => {
      setTimePeriod(e.target.value);
      triggerRefetch(true);
    }

    return (
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 bg-inherit">
        <div className="inline-flex">
          <select value={ranking} onChange={handleRankChange}>
            {rankOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={timePeriod} onChange={handleTimeChange}>
            {timeOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="mx-auto max-w-none"> 
          <div className="overflow-hidden bg-white dark:bg-slate-700 shadow rounded-md sm:rounded-lg">
            <table className="table-fixed w-full text-sm text-gray-600 dark:text-gray-300">
              <thead className="text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between font-semibold uppercase text-sm">
                    <div className="uppercase truncate">Collection</div>
                    <div className="inline-flex items-center">
                      <div className="hidden md:block mr-4">
                        Floor Price
                      </div>
                      <div className="ml-2 flex flex-shrink-0 px-2">
                        <p className="">{displayRank[ranking]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </th></tr></thead>
              <tbody>
                {children}
              </tbody>
              <tfoot className="table-footer-group">
                <tr className={(collectionsData?.collections.length?? 10) % 2 === 0 
                                ? `table-row bg-white dark:bg-gray-900`
                                : `table-row bg-gray-50 dark:bg-gray-800`}>
                  <td className="table-cell">
                    <Footer/>  
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const CollectionRow: React.FC<{
    index: number,
    name: string,
    image: string,
    address: string,
    floor: Decimal | null,
    value?: string
  }> = ({index, name, image, address, floor, value}) => {
    return (
      <tr
        className="bg-gray-50 dark:bg-gray-700"
        key={index}>
        <Link href={`/collection/${address}`}>
          <div className="inline-flex items-center justify-between space-x-2">
            <div>{index + 1}</div>
            <div className="relative h-16 w-16 overflow-hidden">
              <Image
                src={image}
                alt={""}
                fill={true}
                className="object-cover h-16 w-16"
                />
            </div>
            <div className="font-bold mx-2">{name}</div>
            <div>{new Number(floor).toFixed(3)}</div>
            <div className="ml-4">
            {
              ranking != CollectionsRank.salesCount
              ? `${new Number(value).toFixed(3)} ETH`
              : value
            }
            </div>
          </div>
        </Link>
      </tr>
    )
  }

  return (
    <>
      <Table>
        {collectionsData?.collections.map((clc, idx) => {
          const k = clc.collection.floor;
          return (
            <CollectionRow 
              index={idx + pageIndex * viewLength} 
              name={clc.collection.name??""} 
              address={clc.collection.address} 
              image={clc.collection.image}
              value={clc.value}
              floor={clc.collection.floor}
            />
          );
        })}
      </Table>
    </>
  );
}