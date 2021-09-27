/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from "react-icons/fi";

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Home({ postsPagination }: HomeProps) {

  const [nextPageLink, setNextPageLink] = useState(postsPagination.next_page);

  const [goNextPage, setGoNextPage] = useState(false)
  
  const [postData, setPostData] = useState(postsPagination.results)

  
  const handleNextPage = () => {
    setGoNextPage(!goNextPage)

  fetch(nextPageLink)
    .then(response => response.json())
    .then(function(data) {
     
      const dataToLoad = data.results.map(post => {
        return {        
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }
      }
    )

      setPostData(postData.concat(dataToLoad))
      setNextPageLink(data?.next_page)
    }) 


  }

  return (
    <div>
      <Header/>

      <div className={styles.main}>
        <div className={styles.posts}>
          {postData?.map(posts => (
            <Link href={`/post/${posts.uid}`} key={posts.uid}>
              <a>
                <strong>{posts.data.title}</strong>
                  <p>{posts.data.subtitle}</p>
                  <div className={styles.info}>
                    <FiCalendar/>
                    <p>{format(new Date(posts.first_publication_date), 'dd MMM yyyy', {locale: ptBR, })}</p>
                    <FiUser/>
                    <p>{posts.data.author}</p>
                  </div>
                </a>
            </Link>
            ))}
        </div>
        {nextPageLink === null ? (
          false
        ) : <a  className={styles.nextPage} onClick={handleNextPage}>Carregar mais posts</a>}
      </div>


    </div>

  )

}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  
  

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author','posts.content'],
    pageSize: 1,
  });


  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      
    }
  })  


  return {
    props: {postsPagination: {results: posts, next_page: postsResponse.next_page}}
  }
};
