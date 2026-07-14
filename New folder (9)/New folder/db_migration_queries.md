# DB Migration Queries — Subject Registry Backfill

Run these in **MongoDB Shell (mongosh)** or **MongoDB Compass > Aggregations > Run pipeline**.
Run them **in order**. They are idempotent — safe to run multiple times.

---

## Quick Diagnostic — Run First!

Paste this in mongosh to confirm collection names and doc counts:
```js
show collections
// Expected: syllabuses, chunks, sqps, subjects, testconfigs

print("syllabuses:", db.syllabuses.countDocuments());
print("chunks:",     db.chunks.countDocuments());
print("sqps:",       db.sqps.countDocuments());
print("subjects:",   db.subjects.countDocuments());
print("testconfigs:",db.testconfigs.countDocuments());

// Peek at a syllabus doc to confirm field names
printjson(db.syllabuses.findOne({}, { subject:1, class:1, exam_type:1, subjectId:1, _id:0 }));
```

---

## Step 1 — Populate Subject Registry from Syllabus docs

This finds all unique `(subject, class, exam_type)` combinations in the Syllabus collection
and creates a `Subject` registry entry for each one that doesn't already exist.

```js
// Run in mongosh
const syllabi = db.syllabuses.aggregate([
  {
    $group: {
      _id: { subject: "$subject", class: "$class", exam_type: "$exam_type" },
    },
  },
]).toArray();

print("Distinct (subject, class, exam_type) groups found:", syllabi.length);
if (syllabi.length === 0) {
  print("WARNING: No syllabus docs found! Check collection name with 'show collections'");
}

let created = 0, skipped = 0;
for (const doc of syllabi) {
  const { subject: slug, class: gradeId, exam_type: examType } = doc._id;
  if (!slug || !gradeId) { skipped++; continue; }

  const existing = db.subjects.findOne({ slug, gradeId });
  if (existing) { skipped++; continue; }

  const suffix = Math.random().toString(16).slice(2, 7);
  const subjectId = `${slug}_${suffix}`;
  const displayName = slug.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  try {
    db.subjects.insertOne({
      subjectId,
      displayName,
      slug,
      gradeId,
      examType: examType || null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    print(`Created: ${subjectId} (${displayName}, ${gradeId}, ${examType})`);
    created++;
  } catch (e) {
    if (e.code === 11000) { skipped++; } else { print("ERROR: " + e); }
  }
}
print(`\nDone. Created: ${created}, Skipped (already exists): ${skipped}`);
```

---

## Step 2 — Backfill subjectId into Syllabus docs

```js
const subjects = db.subjects.find().toArray();
let updated = 0;
for (const subj of subjects) {
  const result = db.syllabuses.updateMany(
    {
      subject: subj.slug,
      class: subj.gradeId,
      subjectId: { $exists: false },
    },
    { $set: { subjectId: subj.subjectId } }
  );
  updated += result.modifiedCount;
  if (result.modifiedCount > 0)
    print(`Syllabus → ${subj.subjectId}: updated ${result.modifiedCount} docs`);
}
print(`\nTotal Syllabus docs updated: ${updated}`);
```

---

## Step 3 — Backfill subjectId into Chunk (PYQ) docs

```js
const subjects = db.subjects.find().toArray();
let updated = 0;
for (const subj of subjects) {
  const result = db.chunks.updateMany(
    {
      subject: subj.slug,
      class: subj.gradeId,
      subjectId: { $exists: false },
    },
    { $set: { subjectId: subj.subjectId } }
  );
  updated += result.modifiedCount;
  if (result.modifiedCount > 0)
    print(`Chunk → ${subj.subjectId}: updated ${result.modifiedCount} docs`);
}
print(`\nTotal Chunk docs updated: ${updated}`);
```

---

## Step 4 — Backfill subjectId into SQP docs

```js
const subjects = db.subjects.find().toArray();
let updated = 0;
for (const subj of subjects) {
  const result = db.sqps.updateMany(
    {
      subject: subj.slug,
      class: subj.gradeId,
      subjectId: { $exists: false },
    },
    { $set: { subjectId: subj.subjectId } }
  );
  updated += result.modifiedCount;
  if (result.modifiedCount > 0)
    print(`SQP → ${subj.subjectId}: updated ${result.modifiedCount} docs`);
}
print(`\nTotal SQP docs updated: ${updated}`);
```

---

## Step 5 — Migrate TestConfig keys from slug → subjectId

This migrates:
- `grades[g].fullTest.subjectQuestions["physics"]` → `["physics_a3f7"]`  
- `grades[g].boardQuestionCount[board].subjectQuestions["physics"]` → `["physics_a3f7"]`
- `grades[g].subjectSections["physics"]` → `["physics_a3f7"]`
- `grades[g].paperFormats[paperKey]["physics"]` → `["physics_a3f7"]`
- `grades[g].scoring["Physics::mcq"]` → `["physics_a3f7::mcq"]`  (section scoring)

```js
const subjects = db.subjects.find().toArray();
const tc = db.testconfigs.findOne({ configId: "main-config" });
if (!tc) { print("No test config found"); quit(); }

let modified = false;

for (const gradeKey of Object.keys(tc.grades || {})) {
  const grade = tc.grades[gradeKey];

  // Build a map: slug → subjectId for subjects in this grade
  const slugToId = {};
  for (const subj of subjects) {
    if (subj.gradeId === gradeKey || subj.gradeId === gradeKey.replace(/_/g, " ")) {
      slugToId[subj.slug] = subj.subjectId;
    }
  }

  // 5a. fullTest.subjectQuestions
  const ftSQ = grade?.fullTest?.subjectQuestions;
  if (ftSQ) {
    for (const [slug, id] of Object.entries(slugToId)) {
      if (slug in ftSQ && !(id in ftSQ)) {
        ftSQ[id] = ftSQ[slug];
        delete ftSQ[slug];
        modified = true;
        print(`  [${gradeKey}] fullTest.subjectQuestions: ${slug} → ${id}`);
      }
    }
  }

  // 5b. boardQuestionCount.*.subjectQuestions
  const bqc = grade?.boardQuestionCount;
  if (bqc) {
    for (const board of Object.keys(bqc)) {
      const sqs = bqc[board]?.subjectQuestions;
      if (sqs) {
        for (const [slug, id] of Object.entries(slugToId)) {
          if (slug in sqs && !(id in sqs)) {
            sqs[id] = sqs[slug];
            delete sqs[slug];
            modified = true;
            print(`  [${gradeKey}][${board}] boardQuestionCount.subjectQuestions: ${slug} → ${id}`);
          }
        }
      }
    }
  }

  // 5c. subjectSections
  const ss = grade?.subjectSections;
  if (ss) {
    for (const [slug, id] of Object.entries(slugToId)) {
      if (slug in ss && !(id in ss)) {
        ss[id] = ss[slug];
        delete ss[slug];
        modified = true;
        print(`  [${gradeKey}] subjectSections: ${slug} → ${id}`);
      }
    }
  }

  // 5d. scoring keys: "Physics::mcq" → "physics_a3f7::mcq"
  const scoring = grade?.scoring;
  if (scoring) {
    for (const [slug, id] of Object.entries(slugToId)) {
      for (const key of Object.keys(scoring)) {
        // Match both display-name form ("Physics::") and slug form ("physics::")
        const displayName = slug.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        if ((key.startsWith(`${displayName}::`) || key.startsWith(`${slug}::`)) && !key.startsWith(`${id}::`)) {
          const qType = key.slice(key.indexOf("::") + 2);
          const newKey = `${id}::${qType}`;
          scoring[newKey] = scoring[key];
          delete scoring[key];
          modified = true;
          print(`  [${gradeKey}] scoring: "${key}" → "${newKey}"`);
        }
      }
    }
  }

  // 5e. paperFormats — migrate inner subject keys
  // paperFormats is at top level (not inside grades), skip here (handled below)
}

// 5e. paperFormats top-level migration
const pf = tc.paperFormats;
if (pf) {
  for (const paperKey of Object.keys(pf)) {
    // Determine grade from paperKey (e.g. "grade10_cbse" → gradeId "10th" or "grade10")
    const innerMap = pf[paperKey];
    for (const subj of subjects) {
      const slug = subj.slug;
      const id = subj.subjectId;
      if (slug in innerMap && !(id in innerMap)) {
        innerMap[id] = innerMap[slug];
        delete innerMap[slug];
        modified = true;
        print(`  paperFormats[${paperKey}]: ${slug} → ${id}`);
      }
    }
  }
}

if (modified) {
  db.testconfigs.replaceOne({ _id: tc._id }, tc);
  print("\n✅ TestConfig migrated and saved.");
} else {
  print("\n✅ TestConfig already up to date — nothing to migrate.");
}
```

---

## Step 6 — Verify

```js
// Check Subject registry count
print("Subject registry entries:", db.subjects.countDocuments());

// Check Syllabus docs still missing subjectId
print("Syllabus without subjectId:", db.syllabi.countDocuments({ subjectId: { $exists: false } }));

// Check Chunk docs still missing subjectId  
print("Chunk without subjectId:", db.chunks.countDocuments({ subjectId: { $exists: false } }));

// Check SQP docs still missing subjectId
print("SQP without subjectId:", db.sqps.countDocuments({ subjectId: { $exists: false } }));
```

> [!NOTE]
> After running these queries, all new writes from the application use `subjectId` as the key.
> Legacy slug-keyed TestConfig entries will be left behind only for docs not yet migrated by the admin's PATCH flow.

> [!IMPORTANT]
> Replace collection names (`syllabi`, `chunks`, `sqps`, `testconfigs`, `subjects`) with your actual
> MongoDB collection names if they differ. Check with `show collections` in mongosh.
