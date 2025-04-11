import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

// Mock data for demonstration
const recentChats = [
  { id: '1', title: 'Grant Proposal Discussion', updatedAt: new Date().toISOString(), lastMessage: 'Let\'s review the budget section...' },
  { id: '2', title: 'Project Timeline Planning', updatedAt: new Date(Date.now() - 86400000).toISOString(), lastMessage: 'I think we need to adjust our milestones...' },
];

const recentTasks = [
  { id: '1', title: 'Complete grant application', status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 172800000).toISOString() },
  { id: '2', title: 'Review budget projections', status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 345600000).toISOString() },
  { id: '3', title: 'Prepare presentation slides', status: 'todo', priority: 'low', dueDate: new Date(Date.now() + 518400000).toISOString() },
];

const recentFiles = [
  { id: '1', name: 'Grant_Proposal_Draft.docx', type: 'document', size: 2500000, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '2', name: 'Budget_Spreadsheet.xlsx', type: 'spreadsheet', size: 1800000, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

const Dashboard: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Dashboard | GrantCraft</title>
      </Head>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Chats</CardTitle>
                <CardDescription>Your recent conversations</CardDescription>
              </div>
              <Link href="/chats">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentChats.length > 0 ? (
                <div className="space-y-4">
                  {recentChats.map((chat) => (
                    <Link key={chat.id} href={`/chats/${chat.id}`}>
                      <div className="flex flex-col p-3 hover:bg-muted rounded-md transition-colors">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{chat.title}</h3>
                          <span className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recent chats</p>
                  <Link href="/chats/new">
                    <Button>Start a Chat</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Task Overview</CardTitle>
                <CardDescription>Your upcoming tasks</CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="flex justify-between p-3 hover:bg-muted rounded-md transition-colors">
                        <div className="flex flex-col">
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.status === 'todo' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.status === 'todo' ? 'To Do' : 
                               task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                              task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                        </div>
                        {task.dueDate && (
                          <div className="text-xs text-muted-foreground">
                            Due {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No upcoming tasks</p>
                  <Link href="/tasks/new">
                    <Button>Create a Task</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Recently uploaded files</CardDescription>
            </div>
            <Link href="/files">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentFiles.map((file) => (
                    <Link key={file.id} href={`/files/${file.id}`}>
                      <div className="border rounded-md p-3 hover:bg-muted transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                            {file.type === 'document' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1000000).toFixed(1)} MB • {formatDate(file.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No recent files</p>
                <Link href="/files/upload">
                  <Button>Upload a File</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard; 