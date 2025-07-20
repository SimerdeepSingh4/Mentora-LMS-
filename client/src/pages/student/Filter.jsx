import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";

const categories = [
    { id: "Next JS", label: "Next JS" },
    { id: "Data Science", label: "Data Science" },
    { id: "Frontend Development", label: "Frontend Development" },
    { id: "Fullstack Development", label: "Fullstack Development" },
    { id: "MERN Stack Development", label: "MERN Stack Development" },
    { id: "Backend Development", label: "Backend Development" },
    { id: "Javascript", label: "Javascript" },
    { id: "Python", label: "Python" },
    { id: "Docker", label: "Docker" },
    { id: "MongoDB", label: "MongoDB" },
    { id: "HTML", label: "HTML" },
];

const Filter = ({ handleFilterChange }) => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortByPrice, setSortByPrice] = useState("");

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories((prevCategories) => {
            const newCategories = prevCategories.includes(categoryId)
                ? prevCategories.filter((id) => id !== categoryId)
                : [...prevCategories, categoryId];

            setTimeout(() => handleFilterChange(newCategories, sortByPrice), 0);

            return newCategories;
        });
    };


    const selectByPriceHandler = (selectedValue) => {
        setSortByPrice(selectedValue);
        handleFilterChange(selectedCategories, selectedValue);
    }
    return (
        <div className="w-full md:w-[20%] mt-5">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-xl">Filter Options</h1>
                <Select onValueChange={selectByPriceHandler}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sort by price</SelectLabel>
                            <SelectItem value="low">Low to High</SelectItem>
                            <SelectItem value="high">High to Low</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <Separator className="my-4" />
            <div>
                <h1 className="mb-2 font-semibold">CATEGORY</h1>
                {categories.map((category) => (
                    <div key={category.id} className="flex items-center my-2 space-x-2">
                        <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryChange(category.id)}
                        />
                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {category.label}
                        </Label>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default Filter;