import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const borrowingData = [
  { month: "Jan", borrowed: 120, returned: 100 },
  { month: "Feb", borrowed: 150, returned: 130 },
  { month: "Mar", borrowed: 180, returned: 160 },
  { month: "Apr", borrowed: 200, returned: 170 },
  { month: "May", borrowed: 170, returned: 150 },
  { month: "Jun", borrowed: 220, returned: 190 },
];

const visitorData = [
  { name: "Mon", visitors: 45 },
  { name: "Tue", visitors: 62 },
  { name: "Wed", visitors: 78 },
  { name: "Thu", visitors: 55 },
  { name: "Fri", visitors: 90 },
  { name: "Sat", visitors: 35 },
  { name: "Sun", visitors: 20 },
];

const categoryData = [
  { name: "Fiction", value: 35 },
  { name: "Science", value: 25 },
  { name: "History", value: 20 },
  { name: "Technology", value: 15 },
  { name: "Others", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const stats = [
  { title: "Total Books", value: "12,450", change: "+12%" },
  { title: "Active Users", value: "3,200", change: "+8%" },
  { title: "Borrowed Books", value: "856", change: "+24%" },
  { title: "Overdue", value: "42", change: "-5%" },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stat.value}</div>
                <span
                  className={`text-sm font-medium ${stat.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Borrowing Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={borrowingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="borrowed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Library Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Book Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "John borrowed 'Introduction to AI'", time: "2 min ago" },
                { action: "Sarah returned 'Data Science Basics'", time: "15 min ago" },
                { action: "New user registered: Mike", time: "1 hour ago" },
                { action: "5 new books added to Fiction", time: "2 hours ago" },
                { action: "Book 'Physics 101' marked as overdue", time: "3 hours ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
