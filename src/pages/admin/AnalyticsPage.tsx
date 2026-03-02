import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const uploadData = [
  { month: "Jan", uploads: 18 },
  { month: "Feb", uploads: 32 },
  { month: "Mar", uploads: 45 },
  { month: "Apr", uploads: 28 },
  { month: "May", uploads: 52 },
  { month: "Jun", uploads: 38 },
];

const topDocs = [
  { name: "Math Final 2024 S6", downloads: 342 },
  { name: "Physics National Exam 2024", downloads: 287 },
  { name: "Biology Revision S3", downloads: 198 },
  { name: "Chemistry Notes S5", downloads: 156 },
  { name: "English Mock S6", downloads: 134 },
];

const AnalyticsPage = () => {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">{t("nav.analytics")}</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Uploads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={uploadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="uploads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Most Downloaded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm">{doc.name}</span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">{doc.downloads}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
