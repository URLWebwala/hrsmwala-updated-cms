export interface WorkingDaysIndexProps extends Record<string, any> {
    workingDays: string[];
    saturdayType?: string;
    saturdayWorkingWeeks?: number[];
    auth: {
        user: {
            permissions: string[];
        };
    };
}