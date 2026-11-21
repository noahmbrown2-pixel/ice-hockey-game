
# GOAL:
You are an expert in R and the machine learning algorithm "Random Forests" (RF).

Using a very simple dataset and R,  I want to prepare a lesson that explains the basics of RF. 

Because this a simple, "toy" example, I will often ask students to verify an intermediate step with pencil and paper.   This is important.

This is for learning and not for real problem.

# Rules

I am an R programmer, use git and github,  My editor is emacs.  My operating system is Debian 13.

- Use R
- Use the R package "tidymodels" or "randomforest"
- Use R package "dplyr" and other "tidyverse" packages, where you need to.


- In RF, use 3 trees.


- Be terse.
- Wait for user.   Do not do more than asked.
- If you have questions or if anything not clear, ask.

# Final output

- The directory to use:   ~/code/stats_project/TIDYMODELS/
- The final output should be 210_randomForests.R file.
- If the file exists, write over it.  Do not ask user.
- If the file does not exist, create it.
- Use comments very sparingly.  
- Do not elaborate or offer additional explanation.
  
  
# Special Note
- Random Forests uses randomness at several steps.

- For example, RF often selects a (random) subset of rows of the original example. Your R code must add a terse comment similar to "Select random sample" and print the intermediate dataset as a tibble.
 
- Likewise, RF often selects a (random) subset of predictors.   So be sure to add a comment similar to "Select a (subset) of predictors"  and print the intermediate result as a tibble.

- In RF, when splitting a row (also know as creating daughter) the 'gini' or 'entropy' is used.  Here again, show the value of the 'entropy' and print the resulting daughter.   (This is a toy dataset so there will be very few rows, predictors)
