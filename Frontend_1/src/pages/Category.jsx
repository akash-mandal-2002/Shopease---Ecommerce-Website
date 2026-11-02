import { useEffect, useMemo, useState } from 'react';
import { productApi } from '../services/productApi';
import { useRouter } from '../context/RouterContext';
import { EmptyState, ErrorState } from '../components/common/States';
import Button from '../components/common/Button';
import Shop from './Shop';
import {
  belongsToGroup,
  getGroup,
  groupPath,
  pickGroupCategories,
  subcategoryPath,
} from '../utils/categoryGroups';

const DEFAULT_OFFER = 'Up to 70% OFF';

export default function Category({ group: groupKey, sub }) {
  const { navigate } = useRouter();
  const group = getGroup(groupKey);

  const notFound = (
    <main className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState title="Category not found" message="The category you requested does not exist." />
      <div className="mt-5 text-center">
        <Button onClick={() => navigate(group ? groupPath(groupKey) : '/')}>
          {group ? `Back to ${group.label}` : 'Back home'}
        </Button>
      </div>
    </main>
  );

  if (!group) return notFound;

  // Subcategory page: same Shop page / filters / grid, locked to one category.
  if (sub) {
    if (!belongsToGroup(group, sub)) return notFound;
    return (
      <Shop
        key={sub}
        lockedCategory={sub}
        groupKey={groupKey}
        backTo={{ label: group.label, path: groupPath(groupKey) }}
      />
    );
  }

  return <GroupPage key={groupKey} groupKey={groupKey} group={group} />;
}

function GroupBanner({ src, label }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={`${label} banner`}
      onError={() => setFailed(true)}
      className="mb-8 aspect-[2/1] w-full rounded-xl sm:aspect-[16/9] lg:aspect-[24/9]"
    />
  );
}

/* Myntra-style promo tile: gradient frame, image, label, offer, CTA */
function CategoryCard({ category, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const name = category.name || category.title || category.label || category.slug;
  const image = category.image || category.image_url || category.thumbnail;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-sm bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 p-[6px] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
        {image && !imgFailed ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-orange-300">
            {String(name).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="-mx-[6px] -mb-[6px] bg-gradient-to-b from-orange-300 to-amber-400 px-2 pb-3 pt-2 text-center">
        <p className="truncate text-sm font-medium capitalize text-fuchsia-900">{name}</p>
        <p className="mt-0.5 text-xl font-extrabold tracking-tight text-fuchsia-900 sm:text-2xl">
          {category.discount || DEFAULT_OFFER}
        </p>
        <p className="text-base font-semibold text-fuchsia-900 underline-offset-4 group-hover:underline">
          Shop Now
        </p>
      </div>
    </button>
  );
}

function GroupPage({ groupKey, group }) {
  const { navigate } = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    productApi.categories()
      .then((res) => { if (active) { setCategories(res.data); setError(''); } })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [groupKey]);

  const subcategories = useMemo(() => pickGroupCategories(group, categories), [group, categories]);

  const gridClass =
    'mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6';

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      {group.banner && (
        <GroupBanner key={group.banner} src={group.banner} label={group.label} />
      )}

      <div className="mb-8 rounded-sm bg-gradient-to-b from-gray-50 via-gray-100/70 to-white py-6 text-center">
        <h1 style={{fontFamily: "Satoshi-Bold"}} className="font-serif text-3xl font-extrabold uppercase tracking-tight text-gray-800 sm:text-4xl lg:text-5xl">
          Shop by Category
        </h1>
        
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className={gridClass}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[6/6] w-full rounded-sm" />
          ))}
        </div>
      ) : subcategories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          message={`There are no ${group.label} categories to show right now.`}
        />
      ) : (
        <div className={gridClass}>
          {subcategories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              onClick={() => navigate(subcategoryPath(groupKey, category.slug))}
            />
          ))}
        </div>
      )}
    </main>
  );
}