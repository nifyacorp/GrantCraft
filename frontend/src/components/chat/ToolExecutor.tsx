import React, { useState } from 'react';
import { 
  Wrench, 
  Code, 
  FileSpreadsheet, 
  Pencil,
  Terminal, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Tool {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
  status: 'idle' | 'executing' | 'success' | 'error';
}

interface ToolExecutorProps {
  tools: Tool[];
  onExecute: (toolId: string, parameters: Record<string, any>) => Promise<void>;
  className?: string;
}

const ToolExecutor: React.FC<ToolExecutorProps> = ({ tools, onExecute, className }) => {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, Record<string, any>>>({});
  
  const getToolIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'code':
      case 'codeinterpreter':
        return <Code className="h-5 w-5 text-blue-500" />;
      case 'search':
      case 'websearch':
        return <Search className="h-5 w-5 text-purple-500" />;
      case 'terminal':
      case 'shell':
        return <Terminal className="h-5 w-5 text-green-500" />;
      case 'spreadsheet':
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'edit':
      case 'editor':
        return <Pencil className="h-5 w-5 text-orange-500" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusIcon = (status: Tool['status']) => {
    switch (status) {
      case 'executing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getParamValue = (toolId: string, paramName: string) => {
    return paramValues[toolId]?.[paramName] || '';
  };
  
  const setParamValue = (toolId: string, paramName: string, value: any) => {
    setParamValues(prev => ({
      ...prev,
      [toolId]: {
        ...(prev[toolId] || {}),
        [paramName]: value
      }
    }));
  };
  
  const handleExecute = async (tool: Tool) => {
    if (tool.status === 'executing') return;
    
    const params = paramValues[tool.id] || {};
    await onExecute(tool.id, params);
  };
  
  const renderParamInput = (tool: Tool, paramName: string, paramDetails: any) => {
    const value = getParamValue(tool.id, paramName);
    
    switch (paramDetails.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setParamValue(tool.id, paramName, e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
            placeholder={paramDetails.description || paramName}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setParamValue(tool.id, paramName, Number(e.target.value))}
            className="w-full p-2 border rounded-md text-sm"
            placeholder={paramDetails.description || paramName}
          />
        );
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setParamValue(tool.id, paramName, e.target.checked)}
              className="rounded text-primary"
            />
            <span className="text-sm text-muted-foreground">{paramDetails.description || 'Enable'}</span>
          </label>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setParamValue(tool.id, paramName, e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
            placeholder={paramDetails.description || paramName}
          />
        );
    }
  };
  
  const renderResultContent = (tool: Tool) => {
    if (tool.status === 'executing') {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span>Executing...</span>
        </div>
      );
    }
    
    if (tool.status === 'error') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
          {tool.error || 'An error occurred'}
        </div>
      );
    }
    
    if (tool.status === 'success' && tool.result) {
      if (typeof tool.result === 'string') {
        return (
          <div className="bg-muted p-3 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{tool.result}</pre>
          </div>
        );
      }
      
      return (
        <div className="bg-muted p-3 rounded-md">
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(tool.result, null, 2)}</pre>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium flex items-center">
        <Wrench className="h-4 w-4 mr-1" />
        Available Tools
      </h3>
      
      <div className="space-y-2">
        {tools.map((tool) => (
          <Collapsible
            key={tool.id}
            open={expandedTool === tool.id}
            onOpenChange={(open) => setExpandedTool(open ? tool.id : null)}
            className="border rounded-md"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center p-3 h-auto"
              >
                <div className="flex items-center">
                  {getToolIcon(tool.name)}
                  <span className="ml-2 font-medium">{tool.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {getStatusIcon(tool.status)}
                  <span className="text-xs mr-2">
                    {tool.status === 'idle' && 'Ready'}
                    {tool.status === 'executing' && 'Running'}
                    {tool.status === 'success' && 'Complete'}
                    {tool.status === 'error' && 'Failed'}
                  </span>
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-3 pt-0 border-t">
                <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                
                <Tabs defaultValue="params">
                  <TabsList className="mb-2">
                    <TabsTrigger value="params">Parameters</TabsTrigger>
                    <TabsTrigger value="result">Result</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="params">
                    {tool.parameters && Object.keys(tool.parameters).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(tool.parameters).map(([paramName, paramDetails]) => (
                          <div key={paramName}>
                            <label className="text-sm font-medium mb-1 block">
                              {paramName}
                            </label>
                            {renderParamInput(tool, paramName, paramDetails)}
                          </div>
                        ))}
                        
                        <Button 
                          className="w-full mt-3" 
                          onClick={() => handleExecute(tool)}
                          disabled={tool.status === 'executing'}
                        >
                          {tool.status === 'executing' && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          Execute Tool
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-2">
                        This tool doesn't require any parameters.
                        <Button 
                          className="w-full mt-3" 
                          onClick={() => handleExecute(tool)}
                          disabled={tool.status === 'executing'}
                        >
                          {tool.status === 'executing' && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          Execute Tool
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="result">
                    <ScrollArea className="max-h-[200px]">
                      {renderResultContent(tool)}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {tools.length === 0 && (
          <div className="text-center p-4 border rounded-md bg-muted/30">
            <p className="text-muted-foreground text-sm">No tools available for this conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolExecutor;