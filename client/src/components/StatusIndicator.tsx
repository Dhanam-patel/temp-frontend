import { Plane } from "lucide-react";

interface StatusIndicatorProps {
    status: "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY";
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export default function StatusIndicator({ status, size = "md", showLabel = false }: StatusIndicatorProps) {
    const sizeClasses = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
    };

    const iconSizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const statusConfig = {
        PRESENT: {
            color: "bg-green-500",
            label: "Present",
            icon: null,
        },
        ABSENT: {
            color: "bg-yellow-500",
            label: "Absent",
            icon: null,
        },
        LEAVE: {
            color: "bg-blue-500",
            label: "On Leave",
            icon: <Plane className={`${iconSizeClasses[size]} text-blue-600`} />,
        },
        HALF_DAY: {
            color: "bg-orange-500",
            label: "Half Day",
            icon: null,
        },
    };

    const config = statusConfig[status];

    return (
        <div className="inline-flex items-center gap-1.5" title={config.label}>
            {config.icon ? (
                config.icon
            ) : (
                <span className={`${sizeClasses[size]} rounded-full ${config.color}`} />
            )}
            {showLabel && (
                <span className="text-sm text-slate-600">{config.label}</span>
            )}
        </div>
    );
}
