import { useNavigate, useSearch } from "@tanstack/react-router";

export const useCurrentPage = () => {
  const { currentPage } = useSearch({
    from: "/",
  });
  const navigate = useNavigate();
  return [
    currentPage ?? 1,
    (n: number) => {
      navigate({ from: "/", search: { currentPage: n } });
    },
  ] as const;
};
