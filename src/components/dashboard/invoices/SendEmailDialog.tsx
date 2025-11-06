'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSendEmail } from '@/hooks/useInvoices';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const emailSchema = z.object({
    recipient: z.string().email('Invalid email address'),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface SendEmailDialogProps {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SendEmailDialog({ invoice, open, onOpenChange }: SendEmailDialogProps) {
    const [isCustomEmail, setIsCustomEmail] = useState(false);

    const form = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            recipient: '',
            subject: `Your Invoice ${invoice?.invoiceNumber} from Eagle Platform`,
            message: `Dear Customer,\n\nPlease find attached your invoice ${invoice?.invoiceNumber} for your subscription.\n\nThank you for your business!\n\nBest regards,\nEagle Team`,
        },
    });

    const sendEmail = useSendEmail();

    const onSubmit = (data: EmailFormData) => {
        if (!invoice) return;

        sendEmail.mutate(
            { invoiceId: invoice._id, data },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                    setIsCustomEmail(false);
                },
            }
        );
    };

    const userEmail = typeof invoice?.userId === 'object' ? invoice.userId.email : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Invoice via Email</DialogTitle>
                    <DialogDescription>
                        Send invoice {invoice?.invoiceNumber} to the customer
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="recipient"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recipient Email</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {!isCustomEmail && userEmail && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => field.onChange(userEmail)}
                                                    >
                                                        Use Customer Email
                                                    </Button>
                                                    <span className="text-sm text-muted-foreground">
                                                        {userEmail}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsCustomEmail(true)}
                                                    >
                                                        Custom
                                                    </Button>
                                                </div>
                                            )}
                                            {(isCustomEmail || !userEmail) && (
                                                <Input
                                                    placeholder="Enter email address"
                                                    {...field}
                                                />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your message..."
                                            className="min-h-[120px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={sendEmail.isPending}>
                                {sendEmail.isPending ? 'Sending...' : 'Send Email'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}