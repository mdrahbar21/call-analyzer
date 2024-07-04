"use client"

import React, { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {authClient} from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Image from 'next/image';
import Link from 'next/link';
import Sugar from 'sugar';
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Copy,
  File,
  ListFilter,
  MoreVertical,
  Search,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const TranscriptionsPage = () => {
    const { data: session, status } = useSession();
    const [results, setResults] = useState<any[]>([]);
    const [selectedTranscription, setSelectedTranscription] = useState<any | null>(null);
    const [error1, setError1] = useState<string>('');
    const [error2, setError2] = useState<string>('');
    const [loading1, setLoading1] = useState<boolean>(false);
    const [loading2, setLoading2] = useState<boolean>(false);
    const [analysisResults, setAnalysisResults] = useState<any | null>(null);
    const [copySuccess, setCopySuccess] = React.useState('');
    const [files, setFiles] = React.useState<any[]>([]);

    const handleFileChange = (event: any) => {
        setFiles(Array.from(event.target.files));
    };

    const fetchAccessToken = async () => {
      const user = authClient.currentUser;
      if (!user) {
          throw new Error('No user is signed in');
      }

      const idToken = await user.getIdToken(true);
      return idToken;
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (files.length === 0) {
            setError2('Please select files first.');
            return;
        }

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            setError2('')
            setLoading2(true);
            if (!session) {
              throw new Error('User is not authenticated');
            }
            const accessToken = await fetchAccessToken();
            // setSelectedTranscription('')
            console.log(session);
            if (!accessToken) {
              throw new Error('Access token not found');
          }
            const response = await fetch('/api/deepgram', {
                method: 'POST',
                body: formData,
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            // setResults(prevResults => {
            //     const newResults = [result.results[0], ...prevResults];
            //     setSelectedTranscription(result.results[0]);
            //     return newResults;
            // });

        } catch (error: any) {
            setError2(`Transcription failed: ${error.message}`);
        } finally {
            setLoading2(false);
            await fetchTranscriptions();
            // setSelectedTranscription(results[0])
        }
    };


    const fetchTranscriptions = async () => {
      try {
          setError1('');
          setLoading1(true);
          if (!session) {
            throw new Error('User is not authenticated');
          }
          const accessToken = await fetchAccessToken();
          console.log(session);
          if (!accessToken) {
            throw new Error('Access token not found');
          }
          const response = await fetch('/api/firestore/collections/voice', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
          });
          if (!response.ok) {
              throw new Error(`Server error: ${response.statusText}`);
          }
          const ans = await response.json();
          if(ans.length===0){
            setError1('No transcriptions found. Please Analyze a file first.');
          }
          console.log(ans);
          setResults(ans.data);
      } catch (error: any) {
          console.error('Error fetching transcriptions:', error);
          setError1('Failed to fetch transcriptions.');
      } finally {
          setLoading1(false);
      }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authClient, (user) => {
      if (user) {
        fetchTranscriptions();
      }
    });

    return () => unsubscribe();
  }, [status]);

  const formatDate = (timestamp: any) => {
    const date = Sugar.Date.create(timestamp);
    const formattedDate = Sugar.Date.format(date, '%c');
    return <span>{formattedDate}</span>;
  };

  const handleCopy = (text:any) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000); // Clear the success message after 2 seconds
    }).catch(() => {
      setCopySuccess('Failed to copy!');
      setTimeout(() => setCopySuccess(''), 2000); // Clear the error message after 2 seconds
    });
  };

  const handleRowClick = (transcription: any) => {
    setSelectedTranscription(transcription);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className=" md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Transcriptions</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Transcription Logs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src={session?.user?.image || "/placeholder.jpg"}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header> */}
        <main className="grid flex-1 grid-cols-1 gap-4 p-4 sm:px-6 sm:py-0 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {/* <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"> */}
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card
                className="sm:col-span-2" x-chunk="dashboard-05-chunk-0"
              >
                <CardHeader className="pb-3">
                    <CardTitle>Analyze Recordings</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                        Select Conversations (Call Recordings)
                    </CardDescription>
                    <div className="flex flex-nowrap items-center">
                    <form onSubmit={handleSubmit} className="mb-4">
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleFileChange}
                        className="mb-2 p-2 border rounded"
                      />
                      {!loading2 && (
                        <Button type="submit" className="ml-4">
                          New Analysis
                        </Button>
                      )}
                      {loading2 && (
                        <div className="flex items-center ml-4">
                          <svg
                            aria-hidden="true"
                            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="ml-2">Analyzing...</span>
                        </div>
                      )}
                    </form>
                    </div>
                    {error2 && <p className="text-red-500 mt-3 ml-3">{error2}</p>}
                </CardHeader>
              </Card>
            </div>
            </div>
          <div className="col-span-2 grid auto-rows-max items-start gap-4 md:gap-8">
            <Tabs defaultValue="all">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-sm"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-4">
                        <Button className="mt-2" onClick={() => { }}>Apply Filters</Button>
                        <Button className="mt-2 ml-1" onClick={() => { }}>Clear Filters</Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <TabsContent value="all">
                <Card className="sm:col-span-3">
                  <CardHeader className="px-7 sm:col-span-2">
                    <CardTitle>Transcription Logs</CardTitle>
                    <CardDescription>Recent transcription details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading1 && <p>Loading...</p>}
                    {error1 && <p className="text-red-500">{error1}</p>}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="hidden sm:table-cell">Sr.</TableHead>
                            <TableHead className="">File Name</TableHead>
                            <TableHead className='hidden sm:table-cell text-right'>Tags</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result:any, index:number) => (
                            <TableRow key={result.id} className={selectedTranscription && selectedTranscription.id === result.id ? 'selected-row' : ''} onClick={() => handleRowClick(result)}>
                                <TableCell className='hidden md:table-cell'>
                                    <div className="font-medium">{index + 1}</div>
                                </TableCell>
                                <TableCell className='overflow-hidden overflow-wrap break-all' >
                                  <div className="font-medium">{result.fileName}</div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>
                                <div className="flex justify-end flex-wrap gap-1">
                                    {result.analysis.tags.split(/[,/]/).map((tag: string, index: React.Key | null | undefined) => (
                                        <Badge key={index} variant="default">{tag.trim()}</Badge>
                                    ))}
                                </div>
                                  {/* <div>{formatDate(result.createdAt)}</div> */}
                                </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="col-span-1 grid auto-rows-max items-start gap-4 md:gap-8">
            {selectedTranscription && (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-start bg-muted/50">
                  <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">
                      id: {selectedTranscription.id}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" onClick={() => handleCopy(selectedTranscription.id)} />
                        <span className="sr-only">Copy Transcription ID</span>
                      </Button>
                      {copySuccess && <span className="ml-2 text-sm text-gray-500">{copySuccess}</span>}
                    </CardTitle>
                    <CardDescription>{selectedTranscription.fileName}</CardDescription>
                  </div>
                  
                </CardHeader>
                <CardContent className="p-6 text-sm">
                  <div className="grid gap-3">
                    <ul className="grid gap-3">
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">File Name</span>
                        <span>{selectedTranscription.fileName}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created At</span>
                        <span>{formatDate(selectedTranscription.createdAt)}</span>
                      </li>
                    </ul>
                  </div>
                  <Separator className="my-4" />
                  <audio controls src={selectedTranscription.audioURL} className="mb-2"></audio>
                  <Separator className="my-4" />
                  <ScrollArea className="h-96 space-y-2 p-2 rounded-lg">
                    {selectedTranscription && (
                      <div className="grid gap-3">
                        <div className="font-semibold">Analysis Results</div>
                        <ul className="grid gap-3">
                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Summary</span>
                          </li>
                            <span className="text-pretty">{selectedTranscription.analysis.summary}</span>
                            <Separator className="my-4" />

                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground text-left">Call Evaluation</span>
                            <span className="text-right pl-6 font-medium">{selectedTranscription.analysis.callEvaluation}</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground text-left">User Sentiment</span>
                            <span className="text-right pl-6">{selectedTranscription.analysis.userSentiment}</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sentiment Reason</span>
                          </li>
                            <span>{selectedTranscription.analysis.sentimentReason}</span>
                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tags</span>
                            <div className="flex flex-wrap gap-2 text-right">
                              {selectedTranscription.analysis.tags.split('/').map((tag: string, index: React.Key | null | undefined) => (
                                <Badge key={index} variant="default">{tag.trim()}</Badge>
                              ))}
                            </div>
                          </li>
                          <Separator className="my-4" />
                          {selectedTranscription.analysis.sentimentArray && (
                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sentiment Array</span>
                          </li>
                          )}
                          {selectedTranscription.analysis.sentimentArray && (
                          <div>
                            <Line
                              data={{
                                labels: selectedTranscription.analysis.sentimentArray.split(',').map((_:any, index:any) => index),
                                datasets: [
                                  {
                                    fill: false,
                                    // lineTension: 0,
                                    backgroundColor: "#A83636",
                                    borderColor: "#F58B8B",
                                    data: selectedTranscription.analysis.sentimentArray.split(',').map(Number)
                                  }
                                ]
                              }}
                              options={{
                                scales: {
                                  y: {
                                    min: -10,
                                    max: 10
                                  }
                                },
                                plugins: {
                                  legend: {
                                    display: false
                                  }
                                }
                              }}
                            />
                          </div>
                          )}
                        </ul>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TranscriptionsPage;
