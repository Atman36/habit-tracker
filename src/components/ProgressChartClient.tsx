
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Habit, HabitStatus } from '@/lib/types';
import { format, subDays, eachDayOfInterval, parseISO, startOfDay, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ProgressChartClientProps {
  habit: Habit;
}

const chartConfigBase = {
  completedPositive: {
    label: 'Выполнено',
    color: 'hsl(var(--chart-1))', // Blueish for positive
  },
  completedNegative: { 
    label: 'Успешно избежал',
    color: 'hsl(var(--chart-2))', // Greenish for avoided
  },
  failed: {
    label: 'Не выполнено / Срыв',
    color: 'hsl(var(--destructive))', // Red for failed
  },
} satisfies ChartConfig;


export function ProgressChartClient({ habit }: ProgressChartClientProps) {
  const today = startOfDay(new Date());
  const last30Days = eachDayOfInterval({ start: subDays(today, 29), end: today });

  const chartData = last30Days.map(day => {
    const dateString = format(day, 'yyyy-MM-dd');
    const completionOnDay = habit.completions.find(c => c.date === dateString);
    
    let value = 0; // 0 for not marked or skipped
    let status: HabitStatus | 'not_marked' = 'not_marked';

    if (completionOnDay) {
      status = completionOnDay.status;
      if (completionOnDay.status === 'completed') {
        value = 1;
      } else if (completionOnDay.status === 'failed') {
        value = -1; // Or a different representation if needed
      }
    }

    return {
      date: format(day, 'MMM d', { locale: ru }),
      fullDate: dateString,
      value: value,
      status: status,
    };
  });
  
  const hasAnyRelevantCompletions = habit.completions.some(c => c.status === 'completed' || c.status === 'failed');

  if (!habit || !hasAnyRelevantCompletions) {
    return <p className="text-sm text-muted-foreground py-4">Нет данных о выполнении для отображения графика.</p>;
  }
  
  // Dynamically set chart config based on habit type
  const currentChartConfig: ChartConfig = {
    value: { // 'value' is the dataKey used in <Bar dataKey="value" />
      label: habit.type === 'negative' 
             ? chartConfigBase.completedNegative.label 
             : chartConfigBase.completedPositive.label,
      color: habit.type === 'negative' 
             ? chartConfigBase.completedNegative.color 
             : chartConfigBase.completedPositive.color,
    },
     // Add a specific config for failed if you want to color bars differently
    failed_value: { // if value is -1 for failed
        label: chartConfigBase.failed.label,
        color: chartConfigBase.failed.color,
    }
  };


  return (
    <div className="h-[200px] w-full pt-4">
      <ChartContainer config={currentChartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              ticks={[-1, 0, 1]} // Include -1 if failed is represented this way
              domain={[-1.2, 1.2]} // Adjust domain slightly for padding if using -1
              tickFormatter={(value, index) => {
                if (value === 0) return habit.type === 'negative' ? 'Н/Д' : 'Нет';
                if (value === 1) return habit.type === 'negative' ? 'Избежал' : 'Да';
                if (value === -1) return habit.type === 'negative' ? 'Срыв' : 'Провал';
                return '';
              }}
            />
            <RechartsTooltip
              cursor={false}
              content={<ChartTooltipContent
                indicator="dot"
                labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload) {
                        return format(parseISO(payload[0].payload.fullDate), "PPP", { locale: ru });
                    }
                    return label;
                }}
                formatter={(value, name, props) => {
                  const entry = props.payload;
                  let statusLabel = '';
                  
                  if (entry.status === 'completed') {
                    statusLabel = habit.type === 'negative' ? chartConfigBase.completedNegative.label : chartConfigBase.completedPositive.label;
                  } else if (entry.status === 'failed') {
                    statusLabel = chartConfigBase.failed.label;
                  } else {
                     statusLabel = "Нет отметки";
                  }
                  return [entry.value !== 0 ? (entry.value === 1 ? "✓" : "✗") : "-", statusLabel];
                }}
              />}
            />
            <Bar dataKey="value" radius={4} barSize={10}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.status === 'completed' 
                    ? (habit.type === 'negative' ? currentChartConfig.value.color : currentChartConfig.value.color)
                    : entry.status === 'failed' 
                      ? currentChartConfig.failed_value.color
                      : 'hsl(var(--muted))' // Color for not marked or skipped
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
