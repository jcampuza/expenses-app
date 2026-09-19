export default function Footer() {
  return (
    <footer class="border-t bg-accent p-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} ExpenseMate. All rights reserved.
    </footer>
  );
}
