'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { updateCoPilotSession } from '@/ai/flows/update-copilot-session';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CoPilotSession {
  name: string;
  projectDescription: string;
  aiPersonaDescription: string;
  createdBy: string;
  createdAt: Timestamp;
  suggestions?: string[];
  analysis?: {
    analyzedSuggestions: {
      suggestion: string;
      incorporationRationale: string;
      isIncorporated: boolean;
    }[];
    revisedProjectDescription: string;
  };
}

export default function CoPilotSessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { user } = useUserStore();
    const { toast } = useToast();
    
    const [session, setSession] = useState<CoPilotSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newSuggestion, setNewSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        setLoading(true);
        const sessionRef = doc(db, 'copilot-sessions', sessionId);
        const unsubscribe = onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                setSession(doc.data() as CoPilotSession);
                setError(null);
            } else {
                setError("Session not found.");
                setSession(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching session:", err);
            setError("Failed to load session details.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, [sessionId]);

    const handleAddSuggestion = async () => {
        if (!newSuggestion.trim() || !user) return;
        setIsSubmitting(true);
        try {
            await updateCoPilotSession({
                sessionId,
                suggestions: [...(session?.suggestions || []), newSuggestion],
            });
            setNewSuggestion('');
            toast({ title: 'Success', description: 'Your suggestion has been added.' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRunAnalysis = async () => {
        if (!session || !session.suggestions || session.suggestions.length === 0) {
            toast({ title: 'Cannot Analyze', description: 'There are no suggestions to analyze.', variant: 'destructive' });
            return;
        }
        setIsAnalyzing(true);
        try {
            await updateCoPilotSession({
                sessionId,
                runAnalysis: true,
            });
            toast({ title: 'Analysis Complete', description: 'The AI has analyzed the suggestions.' });
        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsAnalyzing(false);
        }
    };


    if (loading) {
        return (
            <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading Co-Pilot Session...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
                <p className="text-destructive">Error: {error}</p>
            </main>
        );
    }

    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="max-w-6xl mx-auto space-y-6">
                 <div>
                    <h1 className="text-3xl font-headline">{session?.name}</h1>
                    <p className="text-muted-foreground">Co-Pilot session started by {session?.createdBy}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">AI Persona</h3>
                                <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">{session?.aiPersonaDescription}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Project Description</h3>
                                <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-md whitespace-pre-wrap">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{session?.projectDescription || ''}</ReactMarkdown>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Team Suggestions</CardTitle>
                                <CardDescription>Add suggestions for the AI to analyze.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {session?.suggestions && session.suggestions.length > 0 ? (
                                        session.suggestions.map((s, i) => <div key={i} className="p-2 bg-secondary rounded-md text-sm">{s}</div>)
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No suggestions have been added yet.</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Textarea placeholder="Type your suggestion here..." value={newSuggestion} onChange={(e) => setNewSuggestion(e.target.value)} rows={2}/>
                                    <Button onClick={handleAddSuggestion} disabled={!newSuggestion.trim() || isSubmitting} size="icon">
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus />}
                                    </Button>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleRunAnalysis} disabled={isAnalyzing || !session?.suggestions?.length} className="w-full">
                                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Run AI Analysis
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {session?.analysis && (
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Analysis & Feedback</CardTitle>
                            <CardDescription>The AI's assessment of the team's suggestions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Analyzed Suggestions</h3>
                                <div className="space-y-4">
                                    {session.analysis.analyzedSuggestions.map((item, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex items-start gap-4">
                                                {item.isIncorporated ? <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />}
                                                <div>
                                                    <p className="font-semibold">{item.suggestion}</p>
                                                    <p className="text-sm text-muted-foreground">{item.incorporationRationale}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="!mt-8">
                                <h3 className="text-lg font-semibold mb-2">Revised Project Description</h3>
                                <div className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap">
                                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {session.analysis.revisedProjectDescription}
                                     </ReactMarkdown>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
