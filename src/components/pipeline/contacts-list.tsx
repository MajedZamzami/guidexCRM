import Link from "next/link";
import type { Company } from "@/lib/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContactRow = { id: string; company_id: string; name: string };

export function ContactsList({
  contacts,
  companies,
}: {
  contacts: ContactRow[];
  companies: Company[];
}) {
  const companyById = new Map(companies.map((c) => [c.id, c]));
  const visibleContacts = contacts.filter((c) => companyById.has(c.company_id));

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleContacts.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                No contacts found.
              </TableCell>
            </TableRow>
          )}
          {visibleContacts.map((contact) => {
            const company = companyById.get(contact.company_id);
            return (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
