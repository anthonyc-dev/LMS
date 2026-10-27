export function AuthBrandPanel() {
  return (
    <aside className="border-border bg-sidebar hidden flex-col justify-between border-r p-10 lg:flex xl:p-14">
      <div className="flex items-center gap-3">
        <img src="/img/logo.png" alt="" className="size-11 object-contain" />
        <div>
          <p className="text-foreground text-sm font-semibold">NCMC Library</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Library Management System
          </p>
        </div>
      </div>
      <div className="my-12 max-w-md">
        <p className="text-primary mb-5 text-xs font-medium tracking-widest uppercase">
          Read. Discover. Learn.
        </p>
        <h2 className="text-foreground font-serif text-5xl leading-[1.12] tracking-tight">
          Your library,
          <br />
          in one place.
        </h2>
        <p className="text-muted-foreground mt-6 max-w-sm text-base leading-7">
          Find your next book, manage your loans, and keep track of what comes
          next.
        </p>
        <img
          src="/img/login.jpg"
          alt=""
          className="mt-10 aspect-[4/3] w-full rounded-lg object-cover"
        />
      </div>
      <p className="text-muted-foreground text-xs leading-5">
        For the students, faculty, and library team of NCMC.
      </p>
    </aside>
  );
}
