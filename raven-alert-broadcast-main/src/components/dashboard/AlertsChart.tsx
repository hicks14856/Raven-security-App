
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";

interface Alert {
  id: string;
  created_at: string;
  status: string;
  type: string;
}

interface AlertsChartProps {
  alerts: Alert[];
}

const AlertsChart = ({ alerts }: AlertsChartProps) => {
  const [timeRange, setTimeRange] = useState("7days");
  
  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case "7days":
        return { start: subDays(today, 6), end: today };
      case "14days":
        return { start: subDays(today, 13), end: today };
      case "30days":
        return { start: subDays(today, 29), end: today };
      case "thisWeek":
        return { start: startOfWeek(today), end: today };
      default:
        return { start: subDays(today, 6), end: today };
    }
  };

  const prepareChartData = () => {
    const { start, end } = getDateRange();
    
    // Generate all days in the range
    const days = eachDayOfInterval({ start, end });
    
    // Initialize counts for each day
    const dailyCounts = days.map(day => ({
      date: format(day, "MMM dd"),
      count: 0,
      raw: day,
    }));
    
    // Count alerts for each day
    alerts.forEach(alert => {
      const alertDate = parseISO(alert.created_at);
      if (isWithinInterval(alertDate, { start, end })) {
        const dateStr = format(alertDate, "MMM dd");
        const dayIndex = dailyCounts.findIndex(d => d.date === dateStr);
        if (dayIndex !== -1) {
          dailyCounts[dayIndex].count += 1;
        }
      }
    });
    
    return dailyCounts;
  };

  const chartData = prepareChartData();

  return (
    <Card className="w-full bg-[#0000001a]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Alert Activity</CardTitle>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="14days">Last 14 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="thisWeek">This week</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Reduced height for the chart container */}
        <div className="h-[180px] w-full lg:h-[160px]">
          <ChartContainer
            config={{
              alerts: {
                label: "Alerts",
                color: "#324a5f", // Using the raven.blue color
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="alerts"
                  stroke="#324a5f"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#324a5f" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        {chartData.every(item => item.count === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-muted-foreground">No alerts data for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsChart;
