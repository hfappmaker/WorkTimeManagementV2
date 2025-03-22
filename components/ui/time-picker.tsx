import { FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Control, Path, FieldValues } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./button";

// 共通の型定義
type TimePickerFieldProps<T extends FieldValues, V> = {
    control: Control<T>;
    name: Path<T> & {
        [P in Path<T>]: T[P] extends V ? P : never;
    }[Path<T>];
    minuteStep?: number;
    showClearButton?: boolean;
    label: string;
};

// 共通のオプション生成関数
const createTimeOptions = (minuteStep: number) => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
        value: i.toString().padStart(2, '0'),
        label: i.toString().padStart(2, '0')
    }));

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

    return { hours, minutes };
};

// 共通のTimePickerFieldコンポーネント
const TimePickerFieldBase = <T extends FieldValues, V>({
    control,
    name,
    minuteStep = 1,
    showClearButton = true,
    valueToTime,
    timeToValue,
    clearValue,
    label
}: TimePickerFieldProps<T, V> & {
    valueToTime: (value: V | undefined | null) => { hour: string; minute: string };
    timeToValue: (hour: string, minute: string, currentValue: V | undefined | null) => V;
    clearValue: V;
    label: string;
}) => {
    const { hours, minutes } = createTimeOptions(minuteStep);

    return (
        <div className="flex flex-col space-y-2">
            <FormField
                control={control}
                name={name}
                render={({ field }) => {
                    const { hour, minute } = valueToTime(field.value as V | undefined | null);

                    return (
                        <FormItem className="flex flex-col space-y-2">
                            <FormLabel>{label}</FormLabel>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                <Select
                                    value={hour}
                                    onValueChange={(newHour) => {
                                        field.onChange(timeToValue(newHour, minute, field.value as V | undefined | null));
                                    }}
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
                                </FormControl>
                                <span className="self-center">:</span>
                                <FormControl>
                                    <Select
                                        value={minute}
                                    onValueChange={(newMinute) => {
                                        field.onChange(timeToValue(hour, newMinute, field.value as V | undefined | null));
                                    }}
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
                                </FormControl>
                            </div>
                            {showClearButton && (
                                <Button
                                    type="button"
                                    onClick={() => field.onChange(clearValue)}
                                    variant="outline"
                                    size="sm"
                                    className="text-sm text-muted-foreground hover:text-foreground w-fit"
                                >
                                    クリア
                                </Button>
                            )}
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        </div>
    );
};

// Date型用のTimePickerField
export function TimePickerFieldForDate<T extends FieldValues>(props: TimePickerFieldProps<T, Date | undefined | null>) {
    return TimePickerFieldBase<T, Date | undefined | null>({
        ...props,
        valueToTime: (value) => {
            if (value === null || value === undefined) {
                return { hour: "", minute: "" };
            }
            const realValue = value instanceof Date ? value : new Date(value);
            return {
                hour: realValue.getUTCHours().toString().padStart(2, '0'),
                minute: realValue.getUTCMinutes().toString().padStart(2, '0')
            };
        },
        timeToValue: (hour, minute, currentValue) => {
            if (hour === "" && minute === "") {
                return null;
            }

            const newDate = new Date(Date.UTC(1970, 0, 1, parseInt(hour) || 0, parseInt(minute) || 0));
            return newDate;
        },
        clearValue: null
    });
}

// number型用のTimePickerField
export function TimePickerFieldForNumber<T extends FieldValues>(props: TimePickerFieldProps<T, number | undefined | null>) {
    return TimePickerFieldBase<T, number | undefined | null>({
        ...props,
        valueToTime: (value) => {
            if (value === null || value === undefined) {
                return { hour: "", minute: "" };
            }
            return {
                hour: Math.floor(value / 60).toString().padStart(2, '0'),
                minute: (value % 60).toString().padStart(2, '0')
            };
        },
        timeToValue: (hour, minute, currentValue) => {
            if (hour === "" && minute === "") {
                return null;
            }

            return (parseInt(hour) || 0) * 60 + (parseInt(minute) || 0);
        },
        clearValue: null
    });
} 