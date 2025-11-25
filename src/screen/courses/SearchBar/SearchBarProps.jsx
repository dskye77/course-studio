import { Search, SlidersHorizontal, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

//
import { useCourseDisplay } from "@/stores/courses";
//
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// -------------------------
// CategorySelect Component
// -------------------------
export function CategorySelect({ categories = [] }) {
  const category = useCourseDisplay((state) => state.category);
  const setCategory = useCourseDisplay((state) => state.setCategory);

  return (
    <select
      className="w-full sm:w-40 bg-background border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      {categories.map((c, i) => (
        <option key={i} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

// -------------------------
// SearchInput Component
// -------------------------
export function SearchInput() {
  const searchQuery = useCourseDisplay((state) => state.searchQuery);
  const setSearchQuery = useCourseDisplay((state) => state.setSearchQuery);

  return (
    <div className="relative flex-1 w-full">
      <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search for courses..."
        className="w-full bg-background border rounded-md pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

// -------------------------
// FilterModal Component
// -------------------------
export function FilterModal() {
  const [open, setOpen] = useState(false);

  const price = useCourseDisplay((state) => state.price);
  const setPrice = useCourseDisplay((state) => state.setPrice);

  const rating = useCourseDisplay((state) => state.rating);
  const setRating = useCourseDisplay((state) => state.setRating);

  const sortPopular = useCourseDisplay((state) => state.sortPopular);
  const setSortPopular = useCourseDisplay((state) => state.setSortPopular);

  const sortPrice = useCourseDisplay((state) => state.sortPrice);
  const setSortPrice = useCourseDisplay((state) => state.setSortPrice);

  const sortRating = useCourseDisplay((state) => state.sortRating);
  const setSortRating = useCourseDisplay((state) => state.setSortRating);

  const [currentPriceFilter, setCurrentPriceFilter] = useState("All");
  const [currentRatingFilter, setCurrentRatingFilter] = useState("All");
  const [currentPopularSort, setCurrentPopularSort] = useState(0);
  const [currentPriceSort, setCurrentPriceSort] = useState(0);
  const [currentRatingSort, setCurrentRatingSort] = useState(0);

  const prices = [
    "All",
    "free",
    "₦500 - ₦1000",
    "₦1000 - ₦3000",
    "₦3000 - ₦10000",
  ];
  const ratings = [
    "All",
    "4 Stars & above",
    "3 Stars & above",
    "2 Stars & above",
  ];

  const handleApplyFilters = () => {
    setPrice(currentPriceFilter);
    setRating(currentRatingFilter);
    setSortPopular(currentPopularSort);
    setSortPrice(currentPriceSort);
    setSortRating(currentRatingSort);

    setOpen(false);
  };

  const handleClose = () => {
    setCurrentPriceFilter(price);
    setCurrentRatingFilter(rating);
    setCurrentPopularSort(sortPopular);
    setCurrentPriceSort(sortPrice);
    setCurrentRatingSort(sortRating);

    setOpen(false);
  };

  const handlePriceSort = (s) => {
    setCurrentPriceSort(currentPriceSort === s ? 0 : s);
  };
  const handlePopularSort = (s) => {
    setCurrentPopularSort(currentPopularSort === s ? 0 : s);
  };
  const handleRatingSort = (s) => {
    setCurrentRatingSort(currentRatingSort === s ? 0 : s);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Options
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Options</DialogTitle>
          <DialogDescription>
            Customize your course search using the options below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Price */}
          <div>
            <Label className="font-semibold">Price</Label>
            <select
              className="w-full mt-2 bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={currentPriceFilter}
              onChange={(e) => setCurrentPriceFilter(e.target.value)}
            >
              {prices.map((priceText) => (
                <option key={priceText} value={priceText}>
                  {priceText}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <Label className="font-semibold">Minimum Rating</Label>
            <select
              className="w-full mt-2 bg-background border rounded-md px-3 py-2 text-sm"
              value={currentRatingFilter}
              onChange={(e) => setCurrentRatingFilter(e.target.value)}
            >
              {ratings.map((ratingText) => (
                <option key={ratingText} value={ratingText}>
                  {ratingText}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}

          {/* Most popular */}
          <div className="flex items-center justify-between py-2">
            <Label>
              Sort by most popular <ArrowDown />
            </Label>
            <Switch
              checked={currentPopularSort === -1}
              onCheckedChange={() => handlePopularSort(-1)}
              className="scale-125"
            />
          </div>

          {/* Most Rated */}
          <div className="flex items-center justify-between py-2">
            <Label>
              Sort by most rated <ArrowDown />
            </Label>
            <Switch
              checked={currentRatingSort === -1}
              onCheckedChange={() => handleRatingSort(-1)}
              className="scale-125"
            />
          </div>

          {/* Most Expensive */}
          <div className="flex items-center justify-between py-2">
            <Label>
              Sort by most expensive <ArrowDown />
            </Label>
            <Switch
              checked={currentPriceSort === -1}
              onCheckedChange={() => handlePriceSort(-1)}
              className="scale-125"
            />
          </div>

          {/* Least Expensive */}
          <div className="flex items-center justify-between py-2">
            <Label>
              Sort by least expensive <ArrowDown />
            </Label>
            <Switch
              checked={currentPriceSort === 1}
              onCheckedChange={() => handlePriceSort(1)}
              className="scale-125"
            />
          </div>

          {/* Apply Button */}
          <Button className="w-full mt-4" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
