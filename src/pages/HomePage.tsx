import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { BookOpen, FileText, GraduationCap, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const classes = ["S1", "S2", "S3", "S4", "S5", "S6"];

const categories = [
  { key: "past-papers", icon: FileText, label: "Past Papers", count: 0 },
  { key: "notes", icon: BookOpen, label: "Notes & Summaries", count: 0 },
  { key: "books", icon: GraduationCap, label: "Books", count: 0 },
  { key: "revision", icon: Search, label: "Revision Materials", count: 0 },
];

const HomePage = () => {
  const { t } = useI18n();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto relative text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            S1 – S6 Resources
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4">
            {t("label.schoolPortal")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("label.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse">
              <Button size="lg" className="gap-2 px-8">
                {t("label.browseResources")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder={t("action.search")} className="pl-11 h-12 text-base bg-card shadow-sm" />
          </div>
        </div>
      </section>

      {/* Class levels */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold mb-8 text-center">Browse by Class</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-2xl mx-auto">
            {classes.map((cls) => (
              <Link key={cls} to={`/browse?class=${cls}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl font-display font-bold text-primary group-hover:scale-110 transition-transform inline-block">
                      {cls}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold mb-8 text-center">Resource Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <Link key={cat.key} to={`/browse?cat=${cat.key}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <cat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{cat.label}</h3>
                    <p className="text-sm text-muted-foreground">Browse all {cat.label.toLowerCase()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
