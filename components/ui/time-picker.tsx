import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ComboBox } from "@/components/ui/select";
import { Control, Path } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeValue {
    hour: string;
    minute: string;
}

interface TimePickerProps {
    value?: TimeValue;
    onChange?: (value: TimeValue) => void;
    className?: string;
}

// 基本的な時刻選択コンポーネント
export function TimePicker({
    value,
    onChange,
    className
}: TimePickerProps) {
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        value: String(i).padStart(2, '0')
    }));

    const minuteOptions = [0, 15, 30, 45].map(minute => ({
        label: String(minute).padStart(2, '0'),
        value: String(minute).padStart(2, '0')
    }));

    return (
        <div className={`flex gap-2 ${className || ''}`}>
            <ComboBox
                value={value?.hour}
                onChange={(newHour) => {
                    onChange?.({
                        hour: newHour,
                        minute: value?.minute || "00"
                    });
                }}
                options={hourOptions}
                placeholder="時"
                onBlur={() => {}}
                name="hour"
                ref={() => {}}
            />
            <ComboBox
                value={value?.minute}
                onChange={(newMinute) => {
                    onChange?.({
                        hour: value?.hour || "00",
                        minute: newMinute
                    });
                }}
                options={minuteOptions}
                placeholder="分"
                onBlur={() => {}}
                name="minute"
                ref={() => {}}
            />
        </div>
    );
}

// Form用のラッパーコンポーネント
interface TimePickerFieldProps {
    control: Control<any>;
    hourFieldName: string;
    minuteFieldName: string;
    minuteStep?: number;
}

export function TimePickerField({
    control,
    hourFieldName,
    minuteFieldName,
    minuteStep = 1
}: TimePickerFieldProps) {
    // 時間の選択肢を生成
    const hours = Array.from({ length: 24 }, (_, i) => ({
        value: i.toString().padStart(2, '0'),
        label: i.toString().padStart(2, '0')
    }));

    // 分の選択肢を生成（minuteStepに基づく）
    const minutes = Array.from(
        { length: Math.floor(60 / minuteStep) },
        (_, i) => {
            const value = (i * minuteStep).toString().padStart(2, '0');
            return {
                value,
                label: value
            };
        }
    );

    return (
        <div className="flex space-x-2">
            <FormField
                control={control}
                name={hourFieldName}
                render={({ field }) => (
                    <FormItem>
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="時" />
                            </SelectTrigger>
                            <SelectContent>
                                {hours.map(hour => (
                                    <SelectItem key={hour.value} value={hour.value}>
                                        {hour.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
            <span className="self-center">:</span>
            <FormField
                control={control}
                name={minuteFieldName}
                render={({ field }) => (
                    <FormItem>
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="分" />
                            </SelectTrigger>
                            <SelectContent>
                                {minutes.map(minute => (
                                    <SelectItem key={minute.value} value={minute.value}>
                                        {minute.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
        </div>
    );
} 