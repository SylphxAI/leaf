import type { h } from "preact";

interface BlogCardProps {
	title: string;
	excerpt: string;
	date: string;
	readTime: string;
	tags: string[];
	image?: string;
	author?: string;
	href: string;
}

export function BlogCard({
	title,
	excerpt,
	date,
	readTime,
	tags,
	image,
	author,
	href,
}: BlogCardProps): h.JSX.Element {
	return (
		<article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800">
			{image && (
				<div className="aspect-video overflow-hidden">
					<img
						src={image}
						alt={title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
			)}

			<div className="flex flex-1 flex-col p-6">
				<div className="flex flex-wrap gap-2 mb-3">
					{tags.map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{tag}
						</span>
					))}
				</div>

				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
					<a
						href={href}
						className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						{title}
					</a>
				</h2>

				<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
					{excerpt}
				</p>

				<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center gap-4">
						{author && <span>By {author}</span>}
						<time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
					</div>
					<span>{readTime}</span>
				</div>
			</div>
		</article>
	);
}
