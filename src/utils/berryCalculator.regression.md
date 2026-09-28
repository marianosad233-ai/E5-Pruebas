# Berry Calculator regression cases

1. Zanama with 156 target plots must require 156 Plain Sweet, 156 Plain Bitter and 156 Very Spicy seeds — never 936 of each.
2. Increasing reserve from 1 to 2 cycles must not double recurring Harvest Tool cost or target revenue. It only increases the one-time reserve shortfall.
3. Source seed calculations must subtract the seeds required to replant Rawst/Pecha/Cheri before counting sellable surplus.
4. Source yield must come from each source berry's own min/max harvest average, not a fixed 4.5.
5. The results table must label missing cycle seeds as “Por producir”.
6. ResultCard title for the target berry must interpolate the selected berry name.
7. GTL fee must be applied only to GTL sales, and remain editable.
8. Local settings should survive a reload; “Restablecer configuración” should clear them.
9. Total farm mode should allocate target plots plus source plots within the available total.
10. Profit/hour should use source growth + target growth only when source crops are actually required for the cycle.
