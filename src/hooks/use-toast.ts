"use client"

import { toast as sonnerToast } from "sonner"

export interface ToastProps {
    title?: string
    description?: string
    variant?: "default" | "success" | "error" | "warning" | "info"
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

export interface LoadingToastHandle {
    dismiss: () => void
    update: (props: Partial<ToastProps>) => void
}

export function useToast() {
    const toast = ({
        title,
        description,
        variant = "default",
        duration,
        action
    }: ToastProps) => {
        const options = {
            description,
            duration,
            action: action ? {
                label: action.label,
                onClick: action.onClick
            } : undefined
        }

        switch (variant) {
            case "error":
                return sonnerToast.error(title || "Error", options)
            case "warning":
                return sonnerToast.warning(title || "Warning", options)
            case "info":
                return sonnerToast.info(title || "Info", options)
            case "success":
                return sonnerToast.success(title || "Success", options)
            default:
                return sonnerToast(title || "Notification", options)
        }
    }

    const success = (title: string, description?: string, duration?: number) => {
        return toast({ title, description, variant: "success", duration })
    }

    const error = (title: string, description?: string, duration?: number) => {
        return toast({ title, description, variant: "error", duration })
    }

    const warning = (title: string, description?: string, duration?: number) => {
        return toast({ title, description, variant: "warning", duration })
    }

    const info = (title: string, description?: string, duration?: number) => {
        return toast({ title, description, variant: "info", duration })
    }

    const loading = (title: string, description?: string): LoadingToastHandle => {
        const toastId = sonnerToast.loading(title, {
            description,
            duration: Infinity // Don't auto-dismiss loading toasts
        })

        return {
            dismiss: () => sonnerToast.dismiss(toastId),
            update: (props: Partial<ToastProps>) => {
                const { title: newTitle, description: newDescription, variant = "success" } = props

                sonnerToast.dismiss(toastId)

                if (variant === "error") {
                    sonnerToast.error(newTitle || title, {
                        description: newDescription || description
                    })
                } else if (variant === "warning") {
                    sonnerToast.warning(newTitle || title, {
                        description: newDescription || description
                    })
                } else {
                    sonnerToast.success(newTitle || title, {
                        description: newDescription || description
                    })
                }
            }
        }
    }

    const promise = <T,>(
        promise: Promise<T>,
        {
            loading: loadingMessage,
            success: successMessage,
            error: errorMessage
        }: {
            loading: string
            success: string | ((data: T) => string)
            error: string | ((error: any) => string)
        }
    ) => {
        return sonnerToast.promise(promise, {
            loading: loadingMessage,
            success: successMessage,
            error: errorMessage
        })
    }

    return {
        toast,
        success,
        error,
        warning,
        info,
        loading,
        promise
    }
}