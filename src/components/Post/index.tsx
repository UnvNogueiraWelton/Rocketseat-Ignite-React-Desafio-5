import { ReactElement } from 'react';
import Link from 'next/link';
import { RiCalendarLine, RiUserLine } from 'react-icons/ri';
import styles from './post.module.scss';

interface PostProps {
  post: {
    uid?: string;
    first_publication_date: string | null;
    data: {
      title: string;
      subtitle: string;
      author: string;
    };
  };
}

export const Post = ({ post }: PostProps): ReactElement => {
  return (
    <article className={styles.container}>
      <h2>
        <Link href={`/post/${post.uid}`}>{post.data.title}</Link>
      </h2>
      <p>{post.data.subtitle}</p>
      <div>
        <span>
          <RiCalendarLine size={20} />
          {post.first_publication_date}
        </span>
        <span>
          <RiUserLine size={20} />
          {post.data.author}
        </span>
      </div>
    </article>
  );
};
