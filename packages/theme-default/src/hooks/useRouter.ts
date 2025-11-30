import {
	useLocation as solidUseLocation,
	useNavigate as solidUseNavigate,
} from "@solidjs/router";

// Re-export SolidJS Router's useLocation
export function useLocation(): ReturnType<typeof solidUseLocation> {
	return solidUseLocation();
}

// Re-export SolidJS Router's useNavigate
export function useNavigate(): ReturnType<typeof solidUseNavigate> {
	return solidUseNavigate();
}
