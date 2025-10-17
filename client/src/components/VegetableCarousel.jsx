import React, { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import { productAPI } from '../utils/api';

const VegetableCarousel = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const leftSentinel = useRef(null);
  const rightSentinel = useRef(null);
  const scrollerRef = useRef(null);

  const load = async (nextPage) => {
    if (loading) return;
    if (!hasNext && nextPage > page) return;
    try {
      setLoading(true);
      const res = await productAPI.getProducts({ category: 'Vegetables', page: nextPage, limit: 8 });
      const data = res.data.data;
      if (nextPage === 1) {
        setItems(data.products);
      } else {
        setItems((prev) => [...prev, ...data.products]);
      }
      setPage(data.pagination.currentPage);
      setHasNext(data.pagination.hasNextPage);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    const left = leftSentinel.current;
    const right = rightSentinel.current;
    if (!left || !right) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!scrollerRef.current) return;
        if (entry.target === right && entry.isIntersecting) {
          load(page + 1);
        }
        if (entry.target === left && entry.isIntersecting) {
          // Optionally handle prepend for RTL
        }
      });
    }, { root: scrollerRef.current, threshold: 1.0 });
    observer.observe(right);
    observer.observe(left);
    return () => observer.disconnect();
  }, [page, hasNext]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Fresh Vegetables</h3>
        {loading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-500" />}
      </div>
      <div
        ref={scrollerRef}
        className="overflow-x-auto no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex gap-4 min-w-full">
          <div ref={leftSentinel} className="w-0" />
          {items.map((p) => (
            <div key={`veg-${p.id}`} className="w-72 flex-shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
          <div ref={rightSentinel} className="w-0" />
        </div>
      </div>
      {!loading && hasNext && (
        <div className="text-center mt-3">
          <button onClick={() => load(page + 1)} className="text-sm text-gray-500 hover:text-gray-700 underline">Load more</button>
        </div>
      )}
    </div>
  );
};

export default VegetableCarousel;
