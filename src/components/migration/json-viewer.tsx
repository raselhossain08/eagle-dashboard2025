"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface JsonViewerProps {
    data: any;
    title: string;
    description?: string;
    onRefresh?: () => void;
    isLoading?: boolean;
}

export function JsonViewer({ data, title, description, onRefresh, isLoading }: JsonViewerProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleCopy = () => {
        const jsonString = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(jsonString);
        toast.success("JSON copied to clipboard");
    };

    const handleDownload = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("JSON file downloaded");
    };

    const renderValue = (value: any, depth: number = 0): React.ReactNode => {
        if (value === null) return <span className="text-muted-foreground">null</span>;
        if (value === undefined) return <span className="text-muted-foreground">undefined</span>;
        if (typeof value === "boolean") return <span className="text-blue-600">{String(value)}</span>;
        if (typeof value === "number") return <span className="text-purple-600">{value}</span>;
        if (typeof value === "string") return <span className="text-green-600">&quot;{value}&quot;</span>;

        if (Array.isArray(value)) {
            if (value.length === 0) return <span>[]</span>;
            return (
                <div className="ml-4">
                    <span>[</span>
                    {value.map((item, index) => (
                        <div key={index} className="ml-4">
                            {renderValue(item, depth + 1)}
                            {index < value.length - 1 && ","}
                        </div>
                    ))}
                    <span>]</span>
                </div>
            );
        }

        if (typeof value === "object") {
            const entries = Object.entries(value);
            if (entries.length === 0) return <span>{"{}"}</span>;

            return (
                <div className="ml-4">
                    <span>{"{"}</span>
                    {entries.map(([key, val], index) => (
                        <div key={key} className="ml-4">
                            <span className="text-orange-600">&quot;{key}&quot;</span>: {renderValue(val, depth + 1)}
                            {index < entries.length - 1 && ","}
                        </div>
                    ))}
                    <span>{"}"}</span>
                </div>
            );
        }

        return String(value);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                        {onRefresh && (
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={onRefresh}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                        )}
                        <Button variant="outline" size="icon-sm" onClick={handleCopy}>
                            <Copy className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon-sm" onClick={handleDownload}>
                            <Download className="size-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mb-2"
                        >
                            {isExpanded ? "Collapse" : "Expand"} All
                        </Button>
                        {isExpanded && (
                            <pre className="bg-muted rounded-lg p-4 overflow-auto max-h-[600px] text-xs font-mono">
                                {renderValue(data)}
                            </pre>
                        )}
                        {!isExpanded && (
                            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
                                Click "Expand All" to view JSON data
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
