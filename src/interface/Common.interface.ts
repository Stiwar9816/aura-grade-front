export type BadgeVariant =
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "electric";

export interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export interface BannerProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    className?: string;
}

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    hoverable?: boolean;
    onClick?: () => void;
}

export interface SectionHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

export interface SkeletonLoaderProps {
    type?: "dashboard" | "table" | "card" | "list";
    count?: number;
}