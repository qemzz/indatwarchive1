import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Shield, UserCheck } from "lucide-react";

const users = [
  { id: "1", name: "Mr. Kamanzi", email: "kamanzi@school.com", role: "teacher", status: "active" },
  { id: "2", name: "Mrs. Uwase", email: "uwase@school.com", role: "teacher", status: "active" },
  { id: "3", name: "Admin DOS", email: "dos@school.com", role: "dos", status: "active" },
  { id: "4", name: "Mr. Habimana", email: "habimana@school.com", role: "teacher", status: "disabled" },
];

const UsersPage = () => {
  const { t } = useI18n();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{t("nav.users")}</h1>
        <Button className="gap-1.5">
          <Users className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "dos" ? "default" : "secondary"} className="gap-1">
                      {user.role === "dos" ? <Shield className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={user.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
