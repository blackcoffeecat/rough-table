/** Table which supports horizontal scrolling.
 * code splitted from DivTable
 */

import React, { ReactNode, FC, CSSProperties, useRef } from "react";
import { css, cx } from "emotion";
import { center, column, flex, rowParted, row, expand } from "@jimengio/shared-utils";
import { Pagination } from "antd";
import { PaginationProps } from "antd/lib/pagination";
import { IRoughTableColumn } from "./rough-div-table";
import { ISimpleObject } from "./types";
import NoDataTableBody, { mergeStyles, EmptyCell } from "./common";

type ScrollDivTableProps<T = any> = FC<{
  className?: string;
  data: T[];
  /** Displayed in headers */
  columns: IRoughTableColumn<T>[];
  rowPadding?: number;
  cellClassName?: string;

  rowKey?: string;
  selectedKeys?: string[];
  onRowClick?: (record: any) => void;
  pageOptions?: PaginationProps;

  /** Default locale is "no data" */
  emptyLocale?: string;
  /** Display empty symbol rather than set it transparent */
  showEmptySymbol?: boolean;
}>;

let ScrollDivTable: ScrollDivTableProps = (props) => {
  const { selectedKeys, rowPadding = 80, showEmptySymbol, rowKey = "id" } = props;
  let columns = props.columns.filter((col) => col != null && !col.hidden);

  let scrollRef = useRef<HTMLDivElement>();
  let headerRef = useRef<HTMLDivElement>();

  let defaultCellWidth = 120;
  let cellWidths: number[] = props.columns.map((columnConfig) => (columnConfig.width as number) || defaultCellWidth);
  let allWidth = cellWidths.reduce((x, y) => x + y) + rowPadding * 2;

  /** Methods */

  let handleScroll = () => {
    let leftOffset = scrollRef.current.scrollLeft;
    headerRef.current.scrollLeft = leftOffset;
  };

  /** Effects */

  /** Renderers */

  let renderPagination = () => {
    let { pageOptions } = props;
    return (
      <div className={stylePageArea}>
        <div className={rowParted}>
          <span />
          <Pagination
            size={pageOptions.size || "small"}
            showQuickJumper={pageOptions.showQuickJumper != null ? pageOptions.showQuickJumper : true}
            {...pageOptions}
          />
        </div>
      </div>
    );
  };

  let hasData = props.data.length > 0;

  let rowPaddingStyle = {};
  if (rowPadding != null) {
    rowPaddingStyle = { paddingLeft: rowPadding, paddingRight: rowPadding };
  }

  let headElements = columns.map((columnConfig, idx) => {
    return (
      <div
        key={idx}
        className={cx(styleCell, props.cellClassName, columnConfig.className)}
        style={mergeStyles(columnConfig.style, { width: columnConfig.width || defaultCellWidth })}
      >
        {columnConfig.title || <EmptyCell showSymbol />}
      </div>
    );
  });

  let bodyElements: ReactNode = <NoDataTableBody emptyLocale={props.emptyLocale} />;

  if (hasData) {
    bodyElements = props.data.map((record, idx) => {
      let rowClassName: string;
      if (selectedKeys != null && selectedKeys.includes(record[rowKey])) {
        rowClassName = styleSelectedRow;
      }

      return (
        <div
          key={idx}
          className={cx(styleRow, props.onRowClick != null && styleCursorPointer, rowClassName)}
          style={mergeStyles({ width: allWidth, minWidth: "100%" }, rowPaddingStyle)}
          onClick={props.onRowClick != null ? () => props.onRowClick(record) : null}
        >
          {props.columns.map((columnConfig, colIdx) => {
            let value = record[columnConfig.dataIndex];
            if (columnConfig.render != null) {
              value = columnConfig.render(value, record);
            }

            return (
              <div
                key={colIdx}
                className={cx(styleCell, props.cellClassName, columnConfig.className)}
                style={mergeStyles(columnConfig.style, { width: columnConfig.width })}
              >
                {value != null ? value : <EmptyCell showSymbol={showEmptySymbol} />}
              </div>
            );
          })}
        </div>
      );
    });
  }

  return (
    <div className={cx(flex, column, props.className)} data-component="scroll-div-table">
      <div className={cx(flex, column, styleArea)} data-area="table-area">
        <div ref={headerRef} className={cx(styleHeaderBar)}>
          <div className={styleRow} style={mergeStyles({ width: allWidth, minWidth: "100%" }, rowPaddingStyle)}>
            {headElements}
          </div>
        </div>
        <div ref={scrollRef} className={cx(expand, styleContentArea)} data-area="wide-area" onScroll={(event) => handleScroll()}>
          {bodyElements}
        </div>
      </div>
      {props.pageOptions != null ? renderPagination() : null}
    </div>
  );
};

export default ScrollDivTable;

const styleCell = css`
  padding: 10px 8px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;

  display: inline-block;
  width: 120px;
`;

const styleHeaderBar = css`
  font-weight: bold;
  background-color: #f2f2f2;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  z-index: 1000;
  overflow: hidden;
`;

const styleRow = css`
  &:hover {
    background-color: #e6f7ff;
  }
  color: rgba(0, 0, 0, 0.65);

  padding-left: 80px;
  border-bottom: 1px solid #e5e5e5;

  width: auto;
`;

const styleCursorPointer = css`
  cursor: pointer;
`;

const styleSelectedRow = css`
  background-color: #e6f7ff;
`;

let stylePageArea = css`
  padding: 16px 8px;
`;

let styleContentArea = css`
  position: relative;
  width: auto;
  white-space: nowrap;
`;

let styleArea = css`
  border: 1px solid #e5e5e5;
  position: relative;
  overflow: hidden;
`;