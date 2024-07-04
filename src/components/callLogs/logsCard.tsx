import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LogsCard = ({ filteredLogs, selectedLog, currentPage, handleRowClick, formatDate, calculateDuration, handlePrevPage, navigateToPage, handleNextPage, inputPage, setInputPage, hasNextPage }:{filteredLogs:any, selectedLog:any, currentPage:any, handleRowClick:any, formatDate:any, calculateDuration:any, handlePrevPage:any, navigateToPage:any, handleNextPage:any, inputPage:any, setInputPage:any, hasNextPage:any }) => {
  return (
    <>
      <Card x-chunk="dashboard-05-chunk-3" className="sm:col-span-3">
        <CardHeader className="px-7 sm:col-span-2">
          <CardTitle>Call Logs</CardTitle>
          <CardDescription>
            Recent call details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">Sr.</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Start Time
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Duration
                </TableHead>
                <TableHead className="text-right">Agent Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log: any, index: number) => (
                <TableRow key={log.id} className={selectedLog && selectedLog.id === log.id ? 'selected-row' : ''} onClick={() => handleRowClick(log)}>
                  <TableCell>
                    <div className="font-medium">{((currentPage - 1) * 10) + index + 1}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.callConfig?.from ?? '+918445979949'}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">{log.type}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="font-medium">{formatDate(log.beginTimestamp._seconds).date}</div>
                    <div className="hidden text-center text-sm text-muted-foreground md:inline">
                      {formatDate(log.beginTimestamp._seconds).time}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {calculateDuration(log.beginTimestamp._seconds, log.endTimestamp._seconds)}
                  </TableCell>
                  <TableCell className="text-right">{log.agent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination>
        <PaginationContent>
          {currentPage - 1 > 0 && (
            <PaginationItem>
              <PaginationPrevious onClick={handlePrevPage} aria-disabled={currentPage === 1}>Previous</PaginationPrevious>
            </PaginationItem>
          )}
          {currentPage - 2 > 0 && (
            <PaginationItem className="">
              <PaginationLink onClick={() => navigateToPage(currentPage - 2)} aria-disabled={currentPage <= 0}>
                {currentPage - 2}
              </PaginationLink>
            </PaginationItem>
          )}
          {currentPage - 1 > 0 && (
            <PaginationItem>
              <PaginationLink onClick={() => navigateToPage(currentPage - 1)} aria-disabled={currentPage <= 0}>
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink onClick={() => navigateToPage(currentPage)}>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          {filteredLogs.length >= 10 && (
            <PaginationItem>
              <PaginationLink onClick={() => navigateToPage(currentPage + 1)}>
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          {filteredLogs.length >= 10 && (
            <PaginationItem>
              <PaginationNext onClick={handleNextPage} aria-disabled={!hasNextPage}>Next</PaginationNext>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
      <div className="flex items-center">
        <Input
          className=""
          type="number"
          value={inputPage}
          onChange={(e) => setInputPage(Number(e.target.value))}
          placeholder="Go to page"
        />
        <Button className="secondary" onClick={() => navigateToPage(Number(inputPage))}>Go</Button>
      </div>
    </>
  );
}

export default LogsCard;
