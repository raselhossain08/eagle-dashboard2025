"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface WPConfigFormProps {
    onSave: (config: { url: string; apiKey: string }) => void;
    initialConfig?: { url: string; apiKey: string };
}

export function WPConfigForm({ onSave, initialConfig }: WPConfigFormProps) {
    const [url, setUrl] = useState(initialConfig?.url || "");
    const [apiKey, setApiKey] = useState(initialConfig?.apiKey || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url || !apiKey) {
            toast.error("Please fill in all fields");
            return;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            toast.error("Please enter a valid URL");
            return;
        }

        setIsLoading(true);
        try {
            onSave({ url, apiKey });
            toast.success("WordPress configuration saved successfully");
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>WordPress Configuration</CardTitle>
                <CardDescription>
                    Configure your WordPress API connection settings
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wp-url">WordPress API URL</Label>
                        <Input
                            id="wp-url"
                            type="text"
                            placeholder="http://my-testing.local/wp-json/api_master/v1/"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Example: http://my-testing.local/wp-json/api_master/v1/
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wp-api-key">X-API Key</Label>
                        <Input
                            id="wp-api-key"
                            type="password"
                            placeholder="am_test_3ba67a073980..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Your WordPress API authentication key
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Configuration"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
