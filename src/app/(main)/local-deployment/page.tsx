
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/store/user-store';
import { AlertCircle, Server, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import copy from 'copy-to-clipboard';
import { useToast } from '@/hooks/use-toast';

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        copy(code);
        toast({ title: 'Copied to clipboard!' });
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7"
                onClick={handleCopy}
            >
                Copy
            </Button>
            <SyntaxHighlighter language="bash" style={atomDark} customStyle={{ margin: 0, borderRadius: '0.375rem' }}>
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default function LocalDeploymentPage() {
  const { user } = useUserStore();

  if (user?.role !== 'admin') {
    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="max-w-4xl mx-auto">
                <Card className="border-destructive/50">
                    <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><AlertCircle/>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p>You do not have the required permissions to view this page. This section is restricted to administrators.</p>
                    </CardContent>
                </Card>
            </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <Server className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-3xl font-headline mt-4">Local Deployment Instructions</h1>
            <p className="text-muted-foreground mt-2">
                Your guide to running the AlphaLink application on your local machine.
            </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Project Setup</CardTitle>
            <CardDescription>
              Install the necessary dependencies for the project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Navigate to the project's root directory in your terminal and run the following command to install all the required Node.js packages defined in `package.json`:</p>
            <CodeBlock code="npm install" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Environment Variables</CardTitle>
            <CardDescription>
              Configure your Gemini API Key for local development.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Create a file named `.env.local` in the root directory of the project. This file will hold your secret API key. Add the following line to it, replacing `YOUR_API_KEY` with your actual Gemini API key:</p>
            <CodeBlock code="GEMINI_API_KEY=YOUR_API_KEY" />
            <p>This file is ignored by Git, ensuring your key is not accidentally committed to version control.</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>3. Running the Application</CardTitle>
            <CardDescription>
              Start the development servers for the Next.js frontend and the Genkit AI flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You will need to open **two separate terminal windows** or tabs to run both the frontend and the AI backend concurrently.</p>
            
            <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Terminal/>Terminal 1: Start the Next.js Frontend</h3>
                <p className="mb-2">This command starts the Next.js application in development mode with Turbopack for faster performance. The application will be accessible at `http://localhost:9002`.</p>
                <CodeBlock code="npm run dev" />
            </div>

            <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Terminal/>Terminal 2: Start Genkit</h3>
                <p className="mb-2">This command starts the Genkit development server, which runs all the AI flows defined in the `src/ai/flows` directory. The Next.js application communicates with this server for all AI-related tasks.</p>
                <CodeBlock code="npm run genkit:dev" />
            </div>

             <p className="!mt-6">Once both servers are running without errors, you can open your browser and navigate to <a href="http://localhost:9002" className="text-primary underline">http://localhost:9002</a> to use the application locally.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
