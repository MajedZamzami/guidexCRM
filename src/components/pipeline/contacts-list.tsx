import Link from "next/link";
import type { Company, Project } from "@/lib/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContactRow = { id: string; project_id: string; name: string };

export function ContactsList({
  contacts,
  projects,
  companies,
}: {
  contacts: ContactRow[];
  projects: Project[];
  companies: Company[];
}) {
  const companyById = new Map(companies.map((c) => [c.id, c]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const rows = contacts
    .map((contact) => {
      const project = projectById.get(contact.project_id);
      const company = project ? companyById.get(project.company_id) : undefined;
      return { contact, project, company };
    })
    .filter((row) => row.company);

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No contacts found.
              </TableCell>
            </TableRow>
          )}
          {rows.map(({ contact, project, company }) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {company && project ? (
                  <Link
                    href={`/companies/${company.id}/projects/${project.id}`}
                    className="text-primary hover:underline"
                  >
                    {project.name}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {company ? (
                  <Link href={`/companies/${company.id}`} className="text-primary hover:underline">
                    {company.name}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
