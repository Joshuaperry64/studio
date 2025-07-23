
'use client';

import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Save, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { getProject, Project } from '@/ai/flows/projects/get-project';
import { updateProject } from '@/ai/flows/projects/update-project';
import { runProjectAnalysis } from '@/ai/flows/projects/run-project-analysis';
import { addSuggestion } from '@/ai/flows/projects/add-suggestion';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/ai/genkit';

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const { user } = useUserStore();
    const { toast } = useToast();
    
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('canvas');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [newSuggestion, setNewSuggestion] = useState('');
    
    // Using transitions for non-critical state updates
    const [isPending, startTransition] = useTransition();

    const [editors, setEditors] = useState({
        roadmap: '',
        canvas: '',
        documentation: ''
    });

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        const projectRef = doc(db, 'projects', projectId);
        const unsubscribe = onSnapshot(projectRef, (docSnap) => {
            if (docSnap.exists()) {
                const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
                setProject(projectData);
                setEditors({
                    roadmap: projectData.roadmap || '',
                    canvas: projectData.canvas || '',
                    documentation: projectData.documentation || '',
                });
            } else {
                setProject(null);
                toast({ title: 'Error', description: 'Project not found.', variant: 'destructive' });
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setLoading(false);
            toast({ title: 'Error', description: 'Failed to listen for project updates.', variant: 'destructive' });
        });

        return () => unsubscribe();
    }, [projectId, toast]);

    const handleSave = async () => {
        if (!project) return;
        setIsSaving(true);
        try {
            await updateProject({
                projectId: project.id,
                roadmap: editors.roadmap,
                canvas: editors.canvas,
                documentation: editors.documentation,
            });
            toast({ title: 'Saved', description: 'Project has been updated.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddSuggestion = async () => {
        if (!newSuggestion.trim()) return;
        try {
            await addSuggestion({ projectId, suggestion: newSuggestion });
            setNewSuggestion('');
            toast({ title: 'Success', description: 'Suggestion added.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add suggestion.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        }
    };

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            await runProjectAnalysis({ projectId });
            toast({ title: 'Analysis Complete', description: 'AI has analyzed the suggestions.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to run analysis.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!project) {
        return <div className="p-6">Project not found.</div>;
    }
    
    const canEdit = project.creatorId === user?.userId;

    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="max-w-7xl mx-auto space-y-4">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Projects</Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-headline">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                         <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <div className="flex justify-between items-center">
                                <TabsList>
                                    <TabsTrigger value="canvas">Canvas</TabsTrigger>
                                    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                                </TabsList>
                                {canEdit && (
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                        Save
                                    </Button>
                                )}
                            </div>
                            <TabsContent value="canvas">
                                <Textarea className="min-h-[600px] font-mono mt-2" value={editors.canvas} onChange={(e) => setEditors(p => ({...p, canvas: e.target.value}))} disabled={!canEdit} />
                            </TabsContent>
                            <TabsContent value="roadmap">
                                <Textarea className="min-h-[600px] font-mono mt-2" value={editors.roadmap} onChange={(e) => setEditors(p => ({...p, roadmap: e.target.value}))} disabled={!canEdit} />
                            </TabsContent>
                            <TabsContent value="documentation">
                                <Textarea className="min-h-[600px] font-mono mt-2" value={editors.documentation} onChange={(e) => setEditors(p => ({...p, documentation: e.target.value}))} disabled={!canEdit} />
                            </TabsContent>
                        </Tabs>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                         <Card>
                             <CardHeader>
                                <CardTitle>AI Co-Pilot</CardTitle>
                                <CardDescription>Add suggestions and run AI analysis.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {project.suggestions && project.suggestions.length > 0 ? (
                                        project.suggestions.map((s, i) => <div key={i} className="p-2 bg-secondary rounded-md text-sm">{s}</div>)
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No suggestions yet.</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Textarea placeholder="Type your suggestion..." value={newSuggestion} onChange={(e) => setNewSuggestion(e.target.value)} rows={1}/>
                                    <Button onClick={handleAddSuggestion} disabled={!newSuggestion.trim()} size="sm">Add</Button>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleRunAnalysis} disabled={isAnalyzing || !project.suggestions?.length} className="w-full">
                                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Run Analysis
                                </Button>
                            </CardFooter>
                        </Card>
                        {project.analysis && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        {project.analysis.analyzedSuggestions.map((item: any, index: number) => (
                                            <div key={index} className="p-3 border rounded-md">
                                                <div className="flex items-start gap-3">
                                                    {item.isIncorporated ? <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />}
                                                    <div>
                                                        <p className="font-semibold text-sm">{item.suggestion}</p>
                                                        <p className="text-xs text-muted-foreground">{item.incorporationRationale}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Revised Documentation</h4>
                                        <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-secondary rounded-md text-xs whitespace-pre-wrap">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {project.analysis.revisedDocumentation}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
