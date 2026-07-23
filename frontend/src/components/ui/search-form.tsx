type SearchFormProps = {
  defaultValue?: string;
};

export function SearchForm({ defaultValue = "" }: SearchFormProps) {
  return (
    <form
      action="/"
      method="get"
      role="search"
      className="flex min-w-0 overflow-hidden rounded-xl border border-transparent bg-secondary p-1 transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
    >
      <label className="sr-only" htmlFor="site-search">
        Search upcoming movies
      </label>
      <input
        id="site-search"
        name="search"
        type="search"
        defaultValue={defaultValue}
        maxLength={80}
        placeholder="Search upcoming movies"
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-subtle sm:px-4"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5"
      >
        Search
      </button>
    </form>
  );
}
